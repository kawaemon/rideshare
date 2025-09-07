export type Destination = "shonandai" | "tsujido";
export type FromSpot = "g_parking" | "delta_back" | "main_cross";

// Branded ID types (compile-time only)
declare const UserIdBrand: unique symbol;
export type UserId = string & { readonly [UserIdBrand]: true };

declare const RideIdBrand: unique symbol;
export type RideId = number & { readonly [RideIdBrand]: true };

export const asUserId = (s: string) => s as UserId;
export const asRideId = (n: number) => n as RideId;

export interface User {
  id: UserId; // ascii lowercase
  name: string;
}

export interface Ride {
  id: RideId;
  driverId: UserId;
  destination: Destination;
  fromSpot: FromSpot;
  departsAt: string; // ISO8601
  capacity: number;
  note: string;
  createdAt: string; // ISO8601
}

export interface RideWithDriver extends Ride {
  driver: User;
}

export interface RideListItem {
  id: RideId;
  driver: User;
  destination: Destination;
  fromSpot: FromSpot;
  departsAt: string;
  capacity: number;
  membersCount: number;
  joined?: boolean;
}

export interface ListRidesParams {
  destination?: Destination;
  fromSpot?: FromSpot;
  date?: string; // YYYY-MM-DD
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
