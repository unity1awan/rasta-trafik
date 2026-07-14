import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRestAreas } from "@/services/trafikverketService";
import { streamChatResponse } from "@/services/aiService";
import { sortByDistance, filterByRoute } from "@/utils/geo";

const ChatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
  fromLat: z.number().optional(),
  fromLng: z.number().optional(),
  toLat: z.number().optional(),
  toLng: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
    }

    const { messages, userLat, userLng, fromLat, fromLng, toLat, toLng } = parsed.data;

    let restAreas = await fetchRestAreas();

    if (fromLat !== undefined && fromLng !== undefined && toLat !== undefined && toLng !== undefined) {
      restAreas = filterByRoute(restAreas, fromLat, fromLng, toLat, toLng);
    }

    if (userLat !== undefined && userLng !== undefined) {
      restAreas = sortByDistance(restAreas, userLat, userLng);
    }

    restAreas = restAreas.slice(0, 50);

    const stream = streamChatResponse(messages, restAreas, userLat, userLng);

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
