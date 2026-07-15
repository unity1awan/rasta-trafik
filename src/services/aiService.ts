import Anthropic from "@anthropic-ai/sdk";
import type { RestArea } from "@/types/RestArea";
import type { Message } from "@/types/Message";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ASSISTANT_RULES = `Regler du alltid följer:
- Svara alltid på svenska.
- Var kortfattad och tydlig — bilister läser ofta på språng.
- För varje rastplats du nämner i svaret: skriv dess Google Maps-länk som en ren URL på en egen rad direkt efter platsnamnet. Aldrig som markdown [text](url), alltid som ren URL.
- Visa aldrig koordinater i svaret.
- Rekommendera platser utifrån användarens fråga (närmast, med toalett, o.s.v.).
- Om du inte vet svaret, säg det ärligt.
- Prata inte om ämnen som inte har med resande eller rastplatser att göra.`;

function buildLocationNote(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return "Användarens position är okänd.";
  return `Användarens nuvarande position är lat: ${lat.toFixed(5)}, lng: ${lng.toFixed(5)}.`;
}

function formatArea(area: RestArea): string {
  const mapsLink = `https://www.google.com/maps?q=${area.location.lat},${area.location.lng}`;

  const facilities = [
    area.hasToilet && (area.isAccessible ? "toalett (handikappanpassad)" : "toalett"),
    area.hasPicnicTable && "picknickbord",
    area.hasPlayground && "lekplats",
    area.hasDumpingStation && "tömningsstation (husbil)",
    area.hasRefuseBin && "sopkorg",
    area.hasLorryParking && `lastbilsparkering (${area.lorrySpaces} platser)`,
  ].filter(Boolean).join(", ");

  const meta = [
    area.isFreeOfCharge ? "gratis" : "avgift",
    area.isOpen ? "öppen" : "stängd",
    area.carSpaces > 0 ? `${area.carSpaces} bilplatser` : "",
  ].filter(Boolean).join(", ");

  return [
    `- ${area.name}`,
    `  Google Maps: ${mapsLink}`,
    `  Faciliteter: ${facilities || "inga registrerade"}`,
    `  Status: ${meta}`,
  ].join("\n");
}

function buildAreasText(areas: RestArea[]): string {
  if (areas.length === 0) return "Inga rastplatser hittades i databasen för tillfället.";
  return areas.map(formatArea).join("\n\n");
}

function buildSystemPrompt(areas: RestArea[], lat?: number, lng?: number): string {
  return `Du är Rasta, en AI-assistent som hjälper bilister att hitta rastplatser längs sin resväg i Sverige.

${buildLocationNote(lat, lng)}

Tillgängliga rastplatser:
${buildAreasText(areas)}

${ASSISTANT_RULES}`;
}

export function streamChatResponse(
  messages: Message[],
  restAreas: RestArea[],
  userLat?: number,
  userLng?: number
): ReadableStream<Uint8Array> {
  const systemPrompt = buildSystemPrompt(restAreas, userLat, userLng);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}
