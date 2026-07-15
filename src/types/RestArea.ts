export interface RestArea {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  hasToilet: boolean;
  isAccessible: boolean;
  hasPicnicTable: boolean;
  hasPlayground: boolean;
  hasDumpingStation: boolean;
  hasRefuseBin: boolean;
  isFreeOfCharge: boolean;
  isOpen: boolean;
  hasLorryParking: boolean;
  lorrySpaces: number;
  carSpaces: number;
}
