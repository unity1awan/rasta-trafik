const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

export async function geocode(place: string): Promise<[number, number] | null> {
  try {
    const url = `${NOMINATIM}?q=${encodeURIComponent(place + ", Sverige")}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RastaTrafik/1.0 (awsard9@gmail.com)" },
    });
    const data = await res.json();
    if (!data[0]) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch {
    return null;
  }
}

export async function fetchRoutePolyline(
  from: [number, number],
  to: [number, number]
): Promise<GeoJSON.LineString | null> {
  try {
    const url = `${OSRM}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    return data.routes?.[0]?.geometry ?? null;
  } catch {
    return null;
  }
}

// Extraherar rutt ur naturliga fraser som:
// "borlänge till stockholm", "från Göteborg till Malmö", "åker från Sundsvall till Umeå"
export function extractRoute(message: string): { from: string; to: string } | null {
  const match = message.match(
    /(?:(?:från|ifrån)\s+)?([A-Za-zÅÄÖåäö\-]+)\s+till\s+([A-Za-zÅÄÖåäö\-]+)/i
  );
  if (!match) return null;
  return { from: match[1].trim(), to: match[2].trim() };
}
