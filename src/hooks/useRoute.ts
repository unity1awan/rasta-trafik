"use client";

import { useState } from "react";
import { geocode } from "@/utils/geocode";

export type RouteCoordinates = {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
};

export function useRoute() {
  const [fromText, setFromTextRaw] = useState("");
  const [toText, setToText] = useState("");
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [coordinates, setCoordinates] = useState<RouteCoordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFromText = (text: string) => {
    setFromTextRaw(text);
    if (fromCoords && text !== "Min position") setFromCoords(null);
  };

  const useGpsAsFrom = () => {
    if (!navigator.geolocation) {
      setError("GPS stöds inte på denna enhet.");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFromCoords({ lat: coords.latitude, lng: coords.longitude });
        setFromTextRaw("Min position");
        setIsGettingGps(false);
      },
      () => {
        setError("Kunde inte hämta din position.");
        setIsGettingGps(false);
      }
    );
  };

  const confirmRoute = async () => {
    if (!fromText.trim() || !toText.trim()) return;
    setError(null);
    setIsGeocoding(true);

    try {
      const fromPromise = fromCoords ? Promise.resolve(fromCoords) : geocode(fromText);
      const [from, to] = await Promise.all([fromPromise, geocode(toText)]);

      if (!from || !to) {
        setError("Kunde inte hitta en eller båda platserna. Kontrollera stavningen.");
        return;
      }

      setCoordinates({ fromLat: from.lat, fromLng: from.lng, toLat: to.lat, toLng: to.lng });
    } finally {
      setIsGeocoding(false);
    }
  };

  const clearRoute = () => {
    setCoordinates(null);
    setFromTextRaw("");
    setToText("");
    setFromCoords(null);
    setError(null);
  };

  return {
    fromText,
    setFromText,
    toText,
    setToText,
    coordinates,
    isGeocoding,
    isGettingGps,
    error,
    useGpsAsFrom,
    confirmRoute,
    clearRoute,
  };
}
