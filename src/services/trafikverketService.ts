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

// Facilitetsnyckelord som indikerar toalett
const TOILET_KEYWORDS = ["wc", "toalett", "toilet", "restroom", "sanitet"];
const WATER_KEYWORDS = ["vatten", "water", "dricksvatten"];
const RESTAURANT_KEYWORDS = ["restaurang", "mat", "café", "kiosk", "food", "matkiosk", "cafeteria"];
const PLAYGROUND_KEYWORDS = ["lek", "lekplats", "playground", "barn"];
const SHOWER_KEYWORDS = ["dusch", "shower"];
const PICNIC_KEYWORDS = ["picknick", "rastbord", "bord", "picnic", "grillplats"];
const ACCESSIBLE_KEYWORDS = ["handikapp", "rörelsehindrad", "tillgänglig", "accessible", "disabled"];

interface RawFacility {
  Type?: string;
  Description?: string;
}

interface RawParkingArea {
  Name?: string;
  Description?: string;
  TypeOfParkingArea?: string;
  Operator?: string;
  Geometry?: { WGS84?: string };
  Facility?: RawFacility | RawFacility[];
}

function buildQuery(apiKey: string): string {
  return `
    <REQUEST>
      <LOGIN authenticationkey="${apiKey}" />
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
        <INCLUDE>Name</INCLUDE>
        <INCLUDE>Description</INCLUDE>
        <INCLUDE>TypeOfParkingArea</INCLUDE>
        <INCLUDE>Operator</INCLUDE>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>Facility</INCLUDE>
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

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function parseFacilities(raw: RawFacility | RawFacility[] | undefined): {
  hasToilet: boolean;
  hasWater: boolean;
  hasRestaurant: boolean;
  hasPlayground: boolean;
  hasShower: boolean;
  hasPicnicTable: boolean;
  isAccessible: boolean;
  facilities: string[];
} {
  const result = {
    hasToilet: false,
    hasWater: false,
    hasRestaurant: false,
    hasPlayground: false,
    hasShower: false,
    hasPicnicTable: false,
    isAccessible: false,
    facilities: [] as string[],
  };

  if (!raw) return result;

  const list = Array.isArray(raw) ? raw : [raw];

  for (const f of list) {
    const combined = `${f.Type ?? ""} ${f.Description ?? ""}`.trim();
    if (!combined) continue;

    result.facilities.push(combined);

    if (matchesKeywords(combined, TOILET_KEYWORDS)) result.hasToilet = true;
    if (matchesKeywords(combined, WATER_KEYWORDS)) result.hasWater = true;
    if (matchesKeywords(combined, RESTAURANT_KEYWORDS)) result.hasRestaurant = true;
    if (matchesKeywords(combined, PLAYGROUND_KEYWORDS)) result.hasPlayground = true;
    if (matchesKeywords(combined, SHOWER_KEYWORDS)) result.hasShower = true;
    if (matchesKeywords(combined, PICNIC_KEYWORDS)) result.hasPicnicTable = true;
    if (matchesKeywords(combined, ACCESSIBLE_KEYWORDS)) result.isAccessible = true;
  }

  return result;
}

function toRestArea(raw: RawParkingArea) {
  const { lat, lng } = parseCoordinates(raw.Geometry?.WGS84);
  const name = raw.Name ?? "";
  const facilityData = parseFacilities(raw.Facility);

  return {
    id: `${name}_${lng}_${lat}`,
    name,
    description: raw.Description ?? raw.TypeOfParkingArea ?? "Rastplats",
    location: { lat, lng },
    typeOfArea: raw.TypeOfParkingArea,
    operator: raw.Operator,
    ...facilityData,
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

    // Logga ett råobjekt för felsökning i server-konsolen
    if (rawList.length > 0) {
      console.log("[Trafikverket] Exempelobjekt:", JSON.stringify(rawList[0], null, 2));
      console.log("[Trafikverket] Totalt antal platser:", rawList.length);
    }

    return rawList
      .map(toRestArea)
      .filter((area) => isRelevant(area.name, area.location.lat, area.location.lng));
  } catch (error) {
    console.error("Fel vid API-anrop:", error);
    return [];
  }
};

// Cache-nyckel v3 — tvingar nytt anrop med utökade fält
export const fetchRestAreas = unstable_cache(fetchRestAreasImpl, ["rastplatser-v3"], {
  revalidate: 3600,
});
