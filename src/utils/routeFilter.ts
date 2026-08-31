import * as turf from "@turf/turf";
import type { RestArea } from "@/types/RestArea";

/**
 * Filtrerar rastplatser till enbart de som ligger längs en given vägpolyline.
 *
 * Strategin: Turf skapar en polygon ("tunnel") runt hela linjen med `bufferKm`
 * kilometers bredd på varje sida. `booleanPointInPolygon` avgör sedan vilka
 * rastplatser som faller innanför tunneln. 3 km är valt som default för att
 * fånga upp rastplatser som ligger en bit från själva vägbanan men är tydligt
 * kopplade till rutten (avfarter, parkeringsplatser m.m.).
 */
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
