import type { CreateRideInput } from "../lib/validate";
import type { DbClient } from "../lib/db-client";
import { canJoin } from "../domain/ride";

export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string };

export class RideService {
  constructor(private readonly db: DbClient) {}

  async list(params: {
    destination?: string;
    fromSpot?: string;
    date?: string;
    viewerId?: string | null;
  }): Promise<
    ServiceResult<
      Array<{
        id: number;
        driver: { id: string };
        destination: string;
        fromSpot: string;
        departsAt: string;
        capacity: number;
        note: string;
        membersCount: number;
        joined: boolean;
      }>
    >
  > {
    const { destination, fromSpot, date, viewerId } = params;
    let departsStart: Date | undefined;
    let departsEnd: Date | undefined;
    if (date) {
      departsStart = new Date(`${date}T00:00:00.000Z`);
      departsEnd = new Date(departsStart.getTime() + 24 * 60 * 60 * 1000);
    }

    const items = await this.db.listRidesWithRelations({
      destination,
      fromSpot,
      departsStart,
      departsEnd,
    });
    const res = items.map((r) => ({
      id: r.id,
      driver: { id: r.driver.id },
      destination: r.destination,
      fromSpot: r.fromSpot,
      departsAt: r.departsAt.toISOString(),
      capacity: r.capacity,
      note: r.note,
      membersCount: r.members?.length ?? 0,
      joined: viewerId ? Boolean(r.members?.some((m) => m.userId === viewerId)) : false,
    }));
    return { ok: true, data: res };
  }

  async create(
    uid: string,
    input: CreateRideInput,
  ): Promise<
    ServiceResult<{
      id: number;
      driver: { id: string };
      destination: string;
      fromSpot: string;
      departsAt: string;
      capacity: number;
      note: string;
      createdAt: string;
    }>
  > {
    const user = await this.db.findUserById(uid);
    if (!user) {
      return { ok: false, error: "user_not_found" };
    }

    const ride = await this.db.createRide({
      driverId: user.id,
      destination: input.destination,
      fromSpot: input.fromSpot,
      departsAt: new Date(input.departsAt),
      capacity: input.capacity,
      note: input.note ?? "",
    });
    return {
      ok: true,
      data: {
        id: ride.id,
        driver: { id: ride.driver.id },
        destination: ride.destination,
        fromSpot: ride.fromSpot,
        departsAt: ride.departsAt.toISOString(),
        capacity: ride.capacity,
        note: ride.note,
        createdAt: ride.createdAt.toISOString(),
      },
    };
  }

  async detail(
    viewerId: string | null | undefined,
    id: number,
  ): Promise<
    ServiceResult<{
      id: number;
      driver: { id: string };
      destination: string;
      fromSpot: string;
      departsAt: string;
      capacity: number;
      note: string;
      createdAt: string;
      membersCount: number;
      joined: boolean;
    }>
  > {
    const r = await this.db.findRideWithMembers(id);
    if (!r) {
      return { ok: false, error: "not_found" };
    }

    return {
      ok: true,
      data: {
        id: r.id,
        driver: { id: r.driver.id },
        destination: r.destination,
        fromSpot: r.fromSpot,
        departsAt: r.departsAt.toISOString(),
        capacity: r.capacity,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
        membersCount: r.members!.length,
        joined: viewerId ? r.members!.some((m) => m.userId === viewerId) : false,
      },
    };
  }

  async join(uid: string, id: number): Promise<ServiceResult<true>> {
    const [user, ride] = await Promise.all([
      this.db.findUserById(uid),
      this.db.findRideWithMembers(id),
    ]);
    if (!user) {
      return { ok: false, error: "user_not_found" };
    }
    if (!ride) {
      return { ok: false, error: "not_found" };
    }
    const decision = canJoin(ride, uid);
    if (!decision.ok) {
      return { ok: false, error: decision.error };
    }
    await this.db.addRideMember(id, uid);
    return { ok: true, data: true };
  }

  async leave(uid: string, id: number): Promise<ServiceResult<true>> {
    const rec = await this.db.findRideMember(id, uid);
    if (!rec) {
      return { ok: false, error: "not_joined" };
    }
    await this.db.deleteRideMember(id, uid);
    return { ok: true, data: true };
  }

  async remove(uid: string, id: number): Promise<ServiceResult<true>> {
    const ride = await this.db.findRideById(id);
    if (!ride) {
      return { ok: false, error: "not_found" };
    }
    if (ride.driverId !== uid) {
      return { ok: false, error: "forbidden" };
    }
    await this.db.deleteRide(id);
    return { ok: true, data: true };
  }

  async listMine(
    uid: string,
    role: "driver" | "member" | "all",
  ): Promise<
    ServiceResult<
      Array<{
        id: number;
        driver: { id: string };
        destination: string;
        fromSpot: string;
        departsAt: string;
        capacity: number;
        note: string;
        membersCount: number;
        joined: boolean;
      }>
    >
  > {
    const rides = await this.db.listRidesWithRelations();
    const filtered = rides.filter((r) => {
      const isDriver = r.driverId === uid;
      const isMember = r.members.some((m) => m.userId === uid);
      if (role === "driver") {
        return isDriver;
      }
      if (role === "member") {
        return isMember;
      }
      return isDriver || isMember;
    });
    const res = filtered.map((r) => ({
      id: r.id,
      driver: { id: r.driver.id },
      destination: r.destination,
      fromSpot: r.fromSpot,
      departsAt: r.departsAt.toISOString(),
      capacity: r.capacity,
      note: r.note,
      membersCount: r.members.length,
      joined: r.members.some((m) => m.userId === uid),
    }));
    return { ok: true, data: res };
  }
}
