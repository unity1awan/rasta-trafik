const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const API_KEY = process.env.TRAFIKVERKET_API_KEY;

interface RawParkingData {
  Name?: string;
  Geometry?: {
    WGS84?: string;
  };
}

export const transformRestArea = (raw: RawParkingData) => {
  const coordsText = raw.Geometry?.WGS84?.replace("POINT (", "").replace(")", "") || "0 0";
  const [lng, lat] = coordsText.split(" ").map(Number);

  return {
    id: (raw.Name || "okand") + lng + lat, 
    name: raw.Name || "Namnlös plats",
    description: "Rastplats/Parkering", 
    location: {
      lat: lat,
      lng: lng
    },
    hasToilet: false,
    hasWater: false,
    isAccessible: false,
  };
};

export const fetchRestAreas = async () => {
  const query = `
    <REQUEST>
      <LOGIN authenticationkey="${API_KEY}" />
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
        <INCLUDE>Name</INCLUDE>
        <INCLUDE>Geometry.WGS84</INCLUDE>
      </QUERY>
    </REQUEST>
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/xml" },
    });

    const data = await response.json();
    
    const rawList = data.RESPONSE.RESULT[0].Parking || [];
    
    // Här byter vi ut (item: any) mot (item: RawParkingData)
    return rawList.map((item: RawParkingData) => transformRestArea(item));
  } catch (error) {
    console.error("Fel vid API-anrop:", error);
    return [];
  }
};