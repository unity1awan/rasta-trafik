const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

export type Coordinate = [number, number];

export async function geocode(place: string): Promise<Coordinate | null> {
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
  from: Coordinate,
  to: Coordinate
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
