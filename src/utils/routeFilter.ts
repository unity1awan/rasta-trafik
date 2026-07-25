import * as turf from "@turf/turf";
import type { RestArea } from "@/types/RestArea";

export function filterByPolyline(
  areas: RestArea[],
  line: GeoJSON.LineString,
  bufferKm = 3
): RestArea[] {
  const turfLine = turf.lineString(line.coordinates as [number, number][]);
  const buffered = turf.buffer(turfLine, bufferKm, { units: "kilometers" });
  if (!buffered) return areas;

  return areas.filter((area) => {
    const point = turf.point([area.location.lng, area.location.lat]);
    return turf.booleanPointInPolygon(point, buffered);
  });
}
