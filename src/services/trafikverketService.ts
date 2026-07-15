import { unstable_cache } from "next/cache";

const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const API_KEY = process.env.TRAFIKVERKET_API_KEY;

if (!API_KEY) {
  throw new Error("TRAFIKVERKET_API_KEY saknas i miljövariablerna.");
}

interface RawEquipment {
  Type?: string;
  Accessibility?: string;
}

interface RawVehicleCharacteristics {
  VehicleType?: string;
  NumberOfSpaces?: number;
}

interface RawParkingArea {
  Id?: string;
  Name?: string;
  Geometry?: { WGS84?: string };
  Equipment?: RawEquipment[];
  UsageSenario?: string[];
  OpenStatus?: string;
  OperationStatus?: string;
  TariffsAndPayment?: { FreeOfCharge?: boolean };
  VehicleCharacteristics?: RawVehicleCharacteristics[];
  Deleted?: boolean;
}

function buildQuery(apiKey: string): string {
  return `
    <REQUEST>
      <LOGIN authenticationkey="${apiKey}" />
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
        <FILTER>
          <EQ name="Deleted" value="false" />
        </FILTER>
        <INCLUDE>Id</INCLUDE>
        <INCLUDE>Name</INCLUDE>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>Equipment</INCLUDE>
        <INCLUDE>UsageSenario</INCLUDE>
        <INCLUDE>OpenStatus</INCLUDE>
        <INCLUDE>OperationStatus</INCLUDE>
        <INCLUDE>TariffsAndPayment</INCLUDE>
        <INCLUDE>VehicleCharacteristics</INCLUDE>
      </QUERY>
    </REQUEST>
  `;
}

function parseCoordinates(wgs84?: string): { lat: number; lng: number } {
  const text = wgs84?.replace("POINT (", "").replace(")", "") ?? "0 0";
  const [lng, lat] = text.split(" ").map(Number);
  return { lat, lng };
}

function toRestArea(raw: RawParkingArea) {
  const { lat, lng } = parseCoordinates(raw.Geometry?.WGS84);
  const equipment = raw.Equipment ?? [];
  const scenarios = raw.UsageSenario ?? [];
  const vehicles = raw.VehicleCharacteristics ?? [];

  const hasEquipment = (type: string) => equipment.some((e) => e.Type === type);
  const hasToilet = hasEquipment("toilet");
  const isAccessible =
    hasToilet &&
    equipment.some(
      (e) => e.Type === "toilet" && e.Accessibility === "handicappedAccessible"
    );

  const lorryEntry = vehicles.find((v) => v.VehicleType === "lorry");
  const carEntry = vehicles.find((v) => v.VehicleType === "car");

  return {
    id: raw.Id ?? `${raw.Name}_${lng}_${lat}`,
    name: raw.Name ?? "Okänd rastplats",
    location: { lat, lng },
    hasToilet,
    isAccessible,
    hasPicnicTable: hasEquipment("picnicFacilities"),
    hasPlayground: hasEquipment("playground"),
    hasDumpingStation: hasEquipment("dumpingStation"),
    hasRefuseBin: hasEquipment("refuseBin"),
    isFreeOfCharge: raw.TariffsAndPayment?.FreeOfCharge ?? true,
    isOpen: raw.OpenStatus === "open",
    hasLorryParking: scenarios.includes("truckParking"),
    lorrySpaces: lorryEntry?.NumberOfSpaces ?? 0,
    carSpaces: carEntry?.NumberOfSpaces ?? 0,
  };
}

function isValid(area: ReturnType<typeof toRestArea>): boolean {
  return area.location.lat !== 0 && area.location.lng !== 0 && !!area.name;
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
    console.log(`[Trafikverket] Hämtade ${rawList.length} platser`);

    return rawList.map(toRestArea).filter(isValid);
  } catch (error) {
    console.error("[Trafikverket] Nätverksfel:", error);
    return [];
  }
};

// v4 — korrekta fältnamn baserade på faktisk API-respons
export const fetchRestAreas = unstable_cache(fetchRestAreasImpl, ["rastplatser-v4"], {
  revalidate: 3600,
});
