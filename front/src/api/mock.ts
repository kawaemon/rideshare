import type {
  Destination,
  FromSpot,
  ListRidesParams,
  Ride,
  RideListItem,
  RideWithDriver,
  User,
  Result,
  UserId,
  RideId,
} from "./types";
import { asRideId, asUserId } from "./types";

// In-memory store (per tab, reset on reload)
const users = new Map<UserId, User>();
const rides: Ride[] = [];
// rideId -> set of userIds
const rideMembers = new Map<RideId, Set<UserId>>();
let nextRideId = 1 as number;

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}
function err(error: string): Result<never> {
  return { ok: false, error };
}

function toListItem(r: Ride, currentUserId?: UserId): RideListItem {
  const set = rideMembers.get(r.id) ?? new Set<UserId>();
  const membersCount = set.size;
  const joined = currentUserId ? set.has(currentUserId) : false;
  const driver = users.get(r.driverId) ?? { id: r.driverId, name: r.driverId };
  return {
    id: r.id,
    driver: { id: driver.id, name: driver.name },
    destination: r.destination,
    fromSpot: r.fromSpot,
    departsAt: r.departsAt,
    capacity: r.capacity,
    membersCount,
    joined,
  };
}

function seed() {
  if (rides.length) return;
  const u1: User = { id: asUserId("kawaemon"), name: "kawaemon" };
  const u2: User = { id: asUserId("rin"), name: "rin" };
  users.set(u1.id, u1);
  users.set(u2.id, u2);
  const base = Date.now() + 1000 * 60 * 30; // 30min later
  const mk = (
    driverId: UserId,
    destination: Destination,
    fromSpot: FromSpot,
    mins: number,
    capacity: number,
    note = ""
  ) => {
    const ride: Ride = {
      id: asRideId(nextRideId++),
      driverId,
      destination,
      fromSpot,
      departsAt: new Date(base + mins * 60000).toISOString(),
      capacity,
      note,
      createdAt: new Date().toISOString(),
    };
    rides.push(ride);
  };
  mk(u1.id, "shonandai", "g_parking", 20, 3, "G駐車場集合");
  mk(u2.id, "tsujido", "delta_back", 45, 2, "デルタ裏");
}

seed();

export async function listRides(
  params: ListRidesParams = {},
  currentUserId?: UserId
): Promise<Result<RideListItem[]>> {
  await delay();
  const { destination, fromSpot, date } = params;
  const data = rides
    .filter((r) => (destination ? r.destination === destination : true))
    .filter((r) => (fromSpot ? r.fromSpot === fromSpot : true))
    .filter((r) => (date ? r.departsAt.startsWith(date) : true))
    .sort((a, b) => a.departsAt.localeCompare(b.departsAt))
    .map((r) => toListItem(r, currentUserId));
  return ok(data);
}

export async function createRide(
  input: Omit<Ride, "id" | "driverId" | "createdAt">,
  driverId: UserId
): Promise<Result<RideWithDriver>> {
  await delay();
  if (!users.has(driverId)) return err("user_not_found");
  const ride: Ride = {
    id: asRideId(nextRideId++),
    driverId,
    destination: input.destination,
    fromSpot: input.fromSpot,
    departsAt: input.departsAt,
    capacity: input.capacity,
    note: input.note ?? "",
    createdAt: new Date().toISOString(),
  };
  rides.push(ride);
  const driver = users.get(driverId)!;
  return ok({ ...ride, driver: { id: driver.id, name: driver.name } });
}

export async function getRide(
  id: RideId,
  currentUserId?: UserId
): Promise<Result<RideWithDriver & { membersCount: number; joined: boolean }>> {
  await delay();
  const r = rides.find((x) => x.id === id);
  if (!r) return err("not_found");
  const driver = users.get(r.driverId) ?? { id: r.driverId, name: r.driverId };
  const set = rideMembers.get(r.id) ?? new Set<UserId>();
  const membersCount = set.size;
  const joined = currentUserId ? set.has(currentUserId) : false;
  return ok({ ...r, driver, membersCount, joined });
}

export async function joinRide(
  id: RideId,
  userId: UserId
): Promise<Result<void>> {
  await delay();
  if (!users.has(userId)) return err("user_not_found");
  const r = rides.find((x) => x.id === id);
  if (!r) return err("not_found");
  const set = rideMembers.get(id) ?? new Set<UserId>();
  if (set.size >= r.capacity) return err("full");
  if (set.has(userId)) return err("already_joined");
  set.add(userId);
  rideMembers.set(id, set);
  return ok<void>(undefined);
}

export async function leaveRide(
  id: RideId,
  userId: UserId
): Promise<Result<void>> {
  await delay();
  const set = rideMembers.get(id);
  if (!set || !set.has(userId)) return err("not_joined");
  set.delete(userId);
  rideMembers.set(id, set);
  return ok<void>(undefined);
}

export async function deleteRide(
  id: RideId,
  userId: UserId
): Promise<Result<void>> {
  await delay();
  const idx = rides.findIndex((x) => x.id === id);
  if (idx === -1) return err("not_found");
  if (rides[idx].driverId !== userId) return err("forbidden");
  rides.splice(idx, 1);
  rideMembers.delete(id);
  return ok<void>(undefined);
}

export async function listMyRides(
  role: "driver" | "member" | "all",
  userId: UserId
): Promise<Result<RideListItem[]>> {
  await delay();
  if (!userId || !users.has(userId)) return ok([]);
  const isMember = (rideId: RideId) =>
    (rideMembers.get(rideId) ?? new Set<UserId>()).has(userId);
  const filtered = rides.filter((r) =>
    role === "driver"
      ? r.driverId === userId
      : role === "member"
      ? isMember(r.id)
      : r.driverId === userId || isMember(r.id)
  );
  const data = filtered
    .sort((a, b) => a.departsAt.localeCompare(b.departsAt))
    .map((r) => toListItem(r, userId));
  return ok(data);
}
