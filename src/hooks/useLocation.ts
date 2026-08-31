"use client";

import { useState } from "react";

type Coordinates = { lat: number; lng: number };

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);

  const requestLocation = (onSuccess?: (loc: Coordinates) => void) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setLocation(loc);
        onSuccess?.(loc);
      },
      () => {}
    );
  };

  return { location, requestLocation };
}
