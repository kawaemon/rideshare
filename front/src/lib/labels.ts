import type { Destination, FromSpot } from "../api/types";

export function labelDestination(v: Destination): string {
  switch (v) {
    case "shonandai":
      return "湘南台";
    case "tsujido":
      return "辻堂";
    default:
      return String(v);
  }
}

export function labelFromSpot(v: FromSpot): string {
  switch (v) {
    case "g_parking":
      return "G駐車場";
    case "delta_back":
      return "デルタ館裏";
    case "main_cross":
      return "正面交差点";
    default:
      return String(v);
  }
}

