import type { CreateRideInput } from "../lib/validate";

export type { CreateRideInput };

interface BaseRideData {
  id: number;
  driver: { id: string };
  destination: string;
  fromSpot: string;
  departsAt: string;
  capacity: number;
  note: string;
}

export interface RideListItemData extends BaseRideData {
  membersCount: number;
  joined: boolean;
}

export interface RideCreateData extends BaseRideData {
  createdAt: string;
}

export interface RideMemberLocationCheckData {
  ip: string;
  matched: boolean | null;
  checkedAt: string;
}

export interface RideDetailData extends RideListItemData {
  createdAt: string;
  verified: boolean;
  members: Array<{
    id: string;
    name: string;
    verified: boolean;
    locationCheck: RideMemberLocationCheckData | null;
  }>;
  selfLocationCheck: RideMemberLocationCheckData | null;
}
