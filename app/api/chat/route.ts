import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRestAreas } from "@/services/trafikverketService";
import { streamChatResponse } from "@/services/aiService";
import { geocode, fetchRoutePolyline } from "@/services/routeService";
import { sortByDistance } from "@/utils/geo";
import { filterByPolyline } from "@/utils/routeFilter";
import { extractRoute, type RouteQuery } from "@/utils/extractRoute";
import type { RestArea } from "@/types/RestArea";

const ChatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
});

/**
 * Geocodar start och mål parallellt, hämtar vägpolyline från OSRM och
 * filtrerar rastplatser till de som ligger inom 3 km från vägbanan.
 * Vid misslyckad geocodning eller nätverksfel returneras hela listan ofiltrerad
 * så att användaren alltid får ett svar.
 */
async function filterAreasByRoute(
  areas: RestArea[],
  route: RouteQuery
): Promise<RestArea[]> {
  const [fromCoords, toCoords] = await Promise.all([
    geocode(route.from),
    geocode(route.to),
  ]);
  if (!fromCoords || !toCoords) return areas;

  const polyline = await fetchRoutePolyline(fromCoords, toCoords);
  if (!polyline) return areas;

  return filterByPolyline(areas, polyline);
}

/**
 * Samordnar all datahämtning och filtrering innan AI-anropet görs.
 * Försöker detektera en rutt i senaste användarmeddelandet — om ingen
 * rutt hittas skickas alla rastplatser, sorterade på avstånd om GPS finns.
 */
async function resolveAreas(
  messages: z.infer<typeof ChatRequestSchema>["messages"],
  userLat?: number,
  userLng?: number
): Promise<{ areas: RestArea[]; routeContext: RouteQuery | null }> {
  let areas = await fetchRestAreas();
  let routeContext: RouteQuery | null = null;

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const detectedRoute = extractRoute(lastUserMessage);

  if (detectedRoute) {
    areas = await filterAreasByRoute(areas, detectedRoute);
    routeContext = detectedRoute;
  }

  if (userLat !== undefined && userLng !== undefined) {
    areas = sortByDistance(areas, userLat, userLng);
  }

  return { areas: areas.slice(0, 50), routeContext };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
    }

    const { messages, userLat, userLng } = parsed.data;
    const { areas, routeContext } = await resolveAreas(messages, userLat, userLng);
    const stream = streamChatResponse(messages, areas, userLat, userLng, routeContext);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API fel:", error);
    return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 });
  }
}
