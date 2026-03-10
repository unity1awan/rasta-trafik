export interface RestArea {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  hasToilet: boolean;
  hasWater: boolean;
  isAccessible: boolean;
}