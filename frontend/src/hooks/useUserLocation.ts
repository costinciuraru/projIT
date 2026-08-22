import { useEffect, useState } from "react";

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser settings to see nearby stores."
            : "Could not determine your location. Please try again.";

        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: message,
        });
      },
    );
  }, []);

  return state;
}
