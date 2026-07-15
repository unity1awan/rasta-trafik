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
  hasRestaurant: boolean;
  hasPlayground: boolean;
  hasShower: boolean;
  hasPicnicTable: boolean;
  facilities: string[];
  typeOfArea?: string;
  operator?: string;
}
