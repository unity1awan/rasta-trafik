import { unstable_cache } from "next/cache";

const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const API_KEY = process.env.TRAFIKVERKET_API_KEY;

if (!API_KEY) {
  throw new Error("TRAFIKVERKET_API_KEY saknas i miljövariablerna.");
}

interface RawParkingArea {
  Id?: string;
  Name?: string;
  Geometry?: { WGS84?: string };
}

function buildQuery(apiKey: string): string {
  return `
    <REQUEST>
      <LOGIN authenticationkey="${apiKey}" />
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
        <FILTER>
          <EQ name="Deleted" value="false" />
          <EQ name="OperationStatus" value="inOperation" />
        </FILTER>
        <INCLUDE>Id</INCLUDE>
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
      console.error("[Trafikverket] API-fel:", JSON.stringify(apiError));
      return [];
    }

    const rawList: RawParkingArea[] = data.RESPONSE?.RESULT?.[0]?.Parking ?? [];
    console.log(`[Trafikverket] Hämtade ${rawList.length} rastplatser`);

    return rawList
      .map((raw) => {
        const { lat, lng } = parseCoordinates(raw.Geometry?.WGS84);
        return {
          id: raw.Id ?? `${raw.Name}_${lng}_${lat}`,
          name: raw.Name ?? "Okänd rastplats",
          location: { lat, lng },
        };
      })
      .filter((a) => a.location.lat !== 0 && a.location.lng !== 0 && !!a.name);
  } catch (error) {
    console.error("[Trafikverket] Nätverksfel:", error);
    return [];
  }
};

// v5 — rensat, bara rastplats + koordinater
export const fetchRestAreas = unstable_cache(fetchRestAreasImpl, ["rastplatser-v5"], {
  revalidate: 3600,
});
