import type { Destination, FromSpot, Location } from "../api/types";

const locationLabels: Record<Location, string> = {
  shonandai: "Shonandai Station",
  tsujido: "Tsujido Station",
  g_parking: "G Parking Lot",
  delta_back: "Delta Building Rear",
  main_cross: "Main Intersection",
};

function labelLocation(value: Location): string {
  return locationLabels[value] ?? String(value);
}

export function labelDestination(value: Destination): string {
  return labelLocation(value);
}

export function labelFromSpot(value: FromSpot): string {
  return labelLocation(value);
}
