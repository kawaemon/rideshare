import type {
  Destination,
  FromSpot,
  ListRidesParams,
  Ride,
  RideDetail,
  RideListItem,
  RideWithDriver,
  Result,
  User,
  UserId,
  RideId,
} from "./types";
import { asRideId, asUserId } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

async function request<T>(
  path: string,
  options: RequestInit & { userId?: string } = {},
): Promise<Result<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };
    if (options.userId) headers["X-User-Id"] = options.userId;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const body: unknown = await res.json();
    if (!res.ok) {
      const error = getErrorMessage(body) ?? (res.statusText || "error");
      return { ok: false, error };
    }
    return { ok: true, data: body as T };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "network_error";
    return { ok: false, error: msg };
  }
}

function getErrorMessage(body: unknown): string | null {
  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }
  return null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function withDriver<T extends { driver: { id: string } }>(
  obj: T,
): T & { driver: User } {
  return {
    ...obj,
    driver: { id: asUserId(obj.driver.id), name: obj.driver.id },
  } as T & { driver: User };
}

export async function listRides(
  params: ListRidesParams = {},
  currentUserId?: UserId,
): Promise<Result<RideListItem[]>> {
  type Resp = Array<{
    id: number;
    driver: { id: string };
    destination: Destination;
    fromSpot: FromSpot;
    departsAt: string;
    capacity: number;
    note: string;
    membersCount: number;
    joined: boolean;
  }>;
  const r = await request<Resp>(`/rides`, {
    method: "GET",
    userId: currentUserId,
  });
  if (!r.ok) return r;
  const items: RideListItem[] = r.data.map((x) => ({
    id: asRideId(x.id),
    driver: { id: asUserId(x.driver.id), name: x.driver.id },
    destination: x.destination,
    fromSpot: x.fromSpot,
    departsAt: x.departsAt,
    capacity: x.capacity,
    note: x.note ?? "",
    membersCount: x.membersCount,
    joined: Boolean(x.joined),
  }));
  const filtered = items.filter((item) => {
    if (params.destination && item.destination !== params.destination) {
      return false;
    }
    if (params.fromSpot && item.fromSpot !== params.fromSpot) {
      return false;
    }
    if (params.date) {
      const departureDate = item.departsAt.slice(0, 10);
      if (departureDate !== params.date) {
        return false;
      }
    }
    return true;
  });
  return { ok: true, data: filtered };
}

export async function createRide(
  input: Omit<Ride, "id" | "driverId" | "createdAt">,
  driverId: UserId,
): Promise<Result<RideWithDriver>> {
  type Resp = {
    id: number;
    driver: { id: string };
    destination: Destination;
    fromSpot: FromSpot;
    departsAt: string;
    capacity: number;
    note: string;
    createdAt: string;
  };
  const r = await request<Resp>(`/rides`, {
    method: "POST",
    body: JSON.stringify(input),
    userId: driverId,
  });
  if (!r.ok) return r as Result<RideWithDriver>;
  const data: RideWithDriver = {
    id: asRideId(r.data.id),
    driverId: asUserId(r.data.driver.id),
    destination: r.data.destination,
    fromSpot: r.data.fromSpot,
    departsAt: r.data.departsAt,
    capacity: r.data.capacity,
    note: r.data.note,
    createdAt: r.data.createdAt,
    driver: { id: asUserId(r.data.driver.id), name: r.data.driver.id },
  };
  return { ok: true, data };
}

export async function getRide(
  id: RideId,
  currentUserId?: UserId,
): Promise<Result<RideDetail>> {
  type Resp = {
    id: number;
    driver: { id: string };
    destination: Destination;
    fromSpot: FromSpot;
    departsAt: string;
    capacity: number;
    note: string;
    createdAt: string;
    membersCount: number;
    joined: boolean;
    verified: boolean;
    members?: Array<{ id: string; name: string; verified: boolean }>;
  };
  const r = await request<Resp>(`/rides/${id}`, {
    method: "GET",
    userId: currentUserId,
  });
  if (!r.ok) return r as Result<RideDetail>;
  const base: RideWithDriver = {
    id: asRideId(r.data.id),
    driverId: asUserId(r.data.driver.id),
    destination: r.data.destination,
    fromSpot: r.data.fromSpot,
    departsAt: r.data.departsAt,
    capacity: r.data.capacity,
    note: r.data.note,
    createdAt: r.data.createdAt,
    driver: { id: asUserId(r.data.driver.id), name: r.data.driver.id },
  };
  return {
    ok: true,
    data: {
      ...base,
      membersCount: r.data.membersCount,
      joined: r.data.joined,
      verified: Boolean(r.data.verified),
      members: (r.data.members ?? []).map((member) => ({
        id: asUserId(member.id),
        name: member.name,
        verified: Boolean(member.verified),
      })),
    },
  };
}

export async function joinRide(
  id: RideId,
  userId: UserId,
): Promise<Result<void>> {
  const r = await request<unknown>(`/rides/${id}/join`, {
    method: "POST",
    userId,
  });
  if (!r.ok) return r as Result<void>;
  return { ok: true, data: undefined };
}

export async function leaveRide(
  id: RideId,
  userId: UserId,
): Promise<Result<void>> {
  const r = await request<unknown>(`/rides/${id}/leave`, {
    method: "POST",
    userId,
  });
  if (!r.ok) return r;
  return { ok: true, data: undefined };
}

export async function deleteRide(
  id: RideId,
  userId: UserId,
): Promise<Result<void>> {
  const r = await request<unknown>(`/rides/${id}`, {
    method: "DELETE",
    userId,
  });
  if (!r.ok) return r;
  return { ok: true, data: undefined };
}

export async function listMyRides(
  role: "driver" | "member" | "all",
  userId: UserId,
): Promise<Result<RideListItem[]>> {
  type Resp = Array<{
    id: number;
    driver: { id: string };
    destination: Destination;
    fromSpot: FromSpot;
    departsAt: string;
    capacity: number;
    note: string;
    membersCount: number;
    joined: boolean;
  }>;
  const r = await request<Resp>(`/me/rides?role=${encodeURIComponent(role)}`, {
    method: "GET",
    userId,
  });
  if (!r.ok) return r;
  const data: RideListItem[] = r.data.map((x) => ({
    id: asRideId(x.id),
    driver: { id: asUserId(x.driver.id), name: x.driver.id },
    destination: x.destination,
    fromSpot: x.fromSpot,
    departsAt: x.departsAt,
    capacity: x.capacity,
    note: x.note ?? "",
    membersCount: x.membersCount,
    joined: Boolean(x.joined),
  }));
  return { ok: true, data };
}

export async function ensureUser(userId: UserId): Promise<Result<void>> {
  const r = await request<{ id: string }>(`/me`, { method: "PUT", userId });
  if (!r.ok) return r;
  return { ok: true, data: undefined };
}

export async function verifyRideMember(
  rideId: RideId,
  memberId: UserId,
  userId: UserId,
): Promise<Result<void>> {
  const r = await request<unknown>(`/rides/${rideId}/members/${memberId}/verify`, {
    method: "POST",
    userId,
  });
  if (!r.ok) return r;
  return { ok: true, data: undefined };
}
