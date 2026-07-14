const EARTH_RADIUS_KM = 6371;

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

function distanceToSegment(
  pointLat: number,
  pointLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const cosLat = Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));

  const px = (pointLng - aLng) * cosLat;
  const py = pointLat - aLat;
  const bx = (bLng - aLng) * cosLat;
  const by = bLat - aLat;

  const segLenSq = bx * bx + by * by;

  if (segLenSq === 0) {
    return calculateDistance(pointLat, pointLng, aLat, aLng);
  }

  const t = Math.max(0, Math.min(1, (px * bx + py * by) / segLenSq));

  const closestLat = aLat + t * by;
  const closestLng = aLng + (t * bx) / cosLat;

  return calculateDistance(pointLat, pointLng, closestLat, closestLng);
}

export function sortByDistance<T extends { location: { lat: number; lng: number } }>(
  items: T[],
  lat: number,
  lng: number
): T[] {
  return [...items].sort(
    (a, b) =>
      calculateDistance(lat, lng, a.location.lat, a.location.lng) -
      calculateDistance(lat, lng, b.location.lat, b.location.lng)
  );
}

export function filterByRoute<T extends { location: { lat: number; lng: number } }>(
  items: T[],
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  corridorKm = 25
): T[] {
  return items.filter(
    (item) =>
      distanceToSegment(
        item.location.lat,
        item.location.lng,
        fromLat,
        fromLng,
        toLat,
        toLng
      ) <= corridorKm
  );
}
