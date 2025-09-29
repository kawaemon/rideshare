import type { Destination, FromSpot, Location } from "../api/types";

const locationLabels: Record<Location, string> = {
  shonandai: "湘南台駅",
  tsujido: "辻堂駅",
  g_parking: "G駐車場",
  delta_back: "デルタ棟裏",
  main_cross: "正門交差点",
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
