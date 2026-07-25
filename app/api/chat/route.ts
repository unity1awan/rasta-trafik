import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRestAreas } from "@/services/trafikverketService";
import { streamChatResponse } from "@/services/aiService";
import { sortByDistance } from "@/utils/geo";
import { filterByPolyline } from "@/utils/routeFilter";
import { geocode, fetchRoutePolyline, extractRoute } from "@/services/routeService";

const ChatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
    }

    const { messages, userLat, userLng } = parsed.data;

    let restAreas = await fetchRestAreas();
    let routeContext: { from: string; to: string } | null = null;

    // Kolla om senaste meddelandet innehåller en rutt ("från X till Y")
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const detected = extractRoute(lastUserMsg);

    if (detected) {
      const [fromCoords, toCoords] = await Promise.all([
        geocode(detected.from),
        geocode(detected.to),
      ]);

      if (fromCoords && toCoords) {
        const polyline = await fetchRoutePolyline(fromCoords, toCoords);
        if (polyline) {
          restAreas = filterByPolyline(restAreas, polyline);
          routeContext = detected;
        }
      }
    }

    // Sortera på avstånd om GPS finns
    if (userLat !== undefined && userLng !== undefined) {
      restAreas = sortByDistance(restAreas, userLat, userLng);
    }

    restAreas = restAreas.slice(0, 50);

    const stream = streamChatResponse(messages, restAreas, userLat, userLng, routeContext);

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
