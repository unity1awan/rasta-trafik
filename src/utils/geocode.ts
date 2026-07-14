const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=se`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RastaTrafik/1.0",
        "Accept-Language": "sv,en",
      },
    });
    const results = await response.json();
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}
