// 今回のハッカソン専用の校内専用 API
// ipv4 アドレスと場所を渡すとそのデバイスがその場所周辺にいるかどうかを判別してくれる

import z from "zod";
import { type Location } from "../../../front/src/api/types";

const resSchema = z.object({
  verificationResult: z.enum(["TRUE", "FALSE", "UNKNOWN"]),
});

export interface LocationVerificationResult {
  matched: boolean | null;
}

const positions: Record<Location, [number, number]> = {
  shonandai: [35.39599362854462, 139.4646325861002],
  tsujido: [35.33664640860116, 139.44706143647136],
  g_parking: [35.38575112805662, 139.42843964550093],
  delta_back: [35.38838964012322, 139.42515400844096],
  main_cross: [35.38949073140438, 139.43159614200434],
};

export function toLocation(value: string): Location | null {
  return Object.hasOwn(positions, value) ? (value as Location) : null;
}

export async function locationVerification(
  // 172.31.1.1 など
  deviceIpv4: string,
  location: Location,
  // true = いる、false = いない, null = わからない
): Promise<LocationVerificationResult> {
  return { matched: true };

  const [latitude, longitude] = positions[location];

  const res = await fetch("https://api.sfc-dtcl-pf.net/location-verification/v0/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "password" },
    body: JSON.stringify({
      device: {
        ipv4Address: {
          publicAddress: deviceIpv4,
        },
      },
      area: {
        areaType: "circoe",
        location: { latitude, longitude },
        accuracy: 50,
      },
    }),
  });

  if (res.status != 200) {
    throw new Error(`location verification failed: ${res.status} ${await res.text()}`);
  }

  const body = await res.json();
  const outcome = resSchema.parse(body).verificationResult;
  return {
    matched: outcome === "TRUE" ? true : outcome === "FALSE" ? false : null,
  };
}
