import { unstable_cache } from "next/cache";

const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const API_KEY = process.env.TRAFIKVERKET_API_KEY;

if (!API_KEY) {
  throw new Error("TRAFIKVERKET_API_KEY saknas i miljövariablerna.");
}

const IRRELEVANT_NAME_PATTERNS = [
  "p-hus", "p-däck", "pendel", "pendelparkering", "busshållplats",
  "bussterminal", "lastkaj", "servicedepå",
];

interface RawParkingArea {
  Name?: string;
  Geometry?: { WGS84?: string };
}

function buildQuery(apiKey: string): string {
  // OBS: <EXISTS> stöds inte av Trafikverkets API — hämtar allt och filtrerar client-side
  return `
    <REQUEST>
      <LOGIN authenticationkey="${apiKey}" />
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
        <INCLUDE>Name</INCLUDE>
        <INCLUDE>Geometry.WGS84</INCLUDE>
      </QUERY>
    </REQUEST>
  `;
}

function parseCoordinates(wgs84?: string): { lat: number; lng: number } {
  const text = wgs84?.replace("POINT (", "").replace(")", "") ?? "0 0";
  const [lng, lat] = text.split(" ").map(Number);
  return { lat, lng };
}

function isRelevant(name: string, lat: number, lng: number): boolean {
  if (!name || lat === 0 || lng === 0) return false;
  const lower = name.toLowerCase();
  return !IRRELEVANT_NAME_PATTERNS.some((pattern) => lower.includes(pattern));
}

function toRestArea(raw: RawParkingArea) {
  const { lat, lng } = parseCoordinates(raw.Geometry?.WGS84);
  const name = raw.Name ?? "";
  return {
    id: `${name}_${lng}_${lat}`,
    name,
    description: "Rastplats/Parkering",
    location: { lat, lng },
    hasToilet: false,
    hasWater: false,
    isAccessible: false,
  };
}

const fetchRestAreasImpl = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: buildQuery(API_KEY!),
      headers: { "Content-Type": "text/xml" },
    });

    const data = await response.json();

    const apiError = data.RESPONSE?.RESULT?.[0]?.ERROR;
    if (apiError) {
      console.error("Trafikverket API-fel:", JSON.stringify(apiError));
      return [];
    }

    const rawList: RawParkingArea[] = data.RESPONSE?.RESULT?.[0]?.Parking ?? [];

    return rawList
      .map(toRestArea)
      .filter((area) => isRelevant(area.name, area.location.lat, area.location.lng));
  } catch (error) {
    console.error("Fel vid API-anrop:", error);
    return [];
  }
};

// Cache-nyckel ändrad till v2 för att tvinga ett färskt anrop och tömma gammal cache
export const fetchRestAreas = unstable_cache(fetchRestAreasImpl, ["rastplatser-v2"], {
  revalidate: 3600,
});
