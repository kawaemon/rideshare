import { getDb } from "./db";
import type { Prisma } from "@prisma/client";

// Domain types (Prisma-independent)
export type User = { id: string; name?: string };
export type RideMember = {
  rideId: number;
  userId: string;
  joinedAt: Date;
  verifiedAt: Date | null;
  locationCheckIp: string | null;
  locationCheckResult: boolean | null;
  locationCheckedAt: Date | null;
  user?: User;
};
export type Ride = {
  id: number;
  driverId: string;
  driver: User;
  destination: string;
  fromSpot: string;
  departsAt: Date;
  capacity: number;
  note: string;
  createdAt: Date;
  members?: RideMember[];
};

export interface RideWithMembers extends Ride {
  members: RideMember[];
}

export type RideFilter = {
  destination?: string;
  fromSpot?: string;
  departsStart?: Date;
  departsEnd?: Date;
};

export interface DbClient {
  // Users
  findUserById(id: string): Promise<User | null>;
  createUser(id: string): Promise<User>;

  // Rides
  listRides(filter?: RideFilter): Promise<Ride[]>;
  listRidesWithRelations(filter?: RideFilter): Promise<RideWithMembers[]>;
  createRide(data: {
    driverId: string;
    destination: string;
    fromSpot: string;
    departsAt: Date;
    capacity: number;
    note?: string;
  }): Promise<Ride>;
  findRideById(id: number): Promise<Ride | null>;
  findRideWithMembers(id: number): Promise<RideWithMembers | null>;
  deleteRide(id: number): Promise<void>;

  // Ride members
  addRideMember(rideId: number, userId: string): Promise<RideMember>;
  findRideMember(rideId: number, userId: string): Promise<RideMember | null>;
  verifyRideMember(rideId: number, userId: string, verifiedAt: Date): Promise<RideMember>;
  recordRideMemberLocationCheck(
    rideId: number,
    userId: string,
    data: { ip: string; result: boolean | null; checkedAt: Date },
  ): Promise<RideMember>;
  deleteRideMember(rideId: number, userId: string): Promise<void>;
}

type RideWithDriverRow = Prisma.RideGetPayload<{ include: { driver: true } }>;
type RideWithMembersRow = Prisma.RideGetPayload<{
  include: { driver: true; members: { include: { user: true } } };
}>;
type RideMemberRow = Prisma.RideMemberGetPayload<{ include: { user: true } }>;

function toDomainUser(user: { id: string; name: string }): User {
  return user.name ? { id: user.id, name: user.name } : { id: user.id };
}

function toDomainRideMember(member: RideMemberRow): RideMember {
  return {
    rideId: member.rideId,
    userId: member.userId,
    joinedAt: member.joinedAt,
    verifiedAt: member.verifiedAt,
    locationCheckIp: member.locationCheckIp,
    locationCheckResult: member.locationCheckResult,
    locationCheckedAt: member.locationCheckedAt,
    user: member.user ? toDomainUser(member.user) : undefined,
  };
}

function toDomainRide(ride: RideWithDriverRow): Ride {
  const base: Ride = {
    id: ride.id,
    driverId: ride.driverId,
    driver: toDomainUser(ride.driver),
    destination: ride.destination,
    fromSpot: ride.fromSpot,
    departsAt: ride.departsAt,
    capacity: ride.capacity,
    note: ride.note,
    createdAt: ride.createdAt,
  };
  return base;
}

function toDomainRideWithMembers(ride: RideWithMembersRow): RideWithMembers {
  return {
    ...toDomainRide(ride),
    members: ride.members.map((member) => toDomainRideMember(member)),
  };
}

class PrismaDbClient implements DbClient {
  async findUserById(id: string): Promise<User | null> {
    const db = getDb();
    return db.user.findUnique({ where: { id } });
  }

  async createUser(id: string): Promise<User> {
    const db = getDb();
    return db.user.create({ data: { id } });
  }

  async listRides(filter?: RideFilter): Promise<Ride[]> {
    const db = getDb();
    const where: Prisma.RideWhereInput = {};
    if (filter?.destination) {
      where.destination = filter.destination;
    }
    if (filter?.fromSpot) {
      where.fromSpot = filter.fromSpot;
    }
    if (filter?.departsStart || filter?.departsEnd) {
      where.departsAt = {
        ...(filter.departsStart ? { gte: filter.departsStart } : {}),
        ...(filter.departsEnd ? { lt: filter.departsEnd } : {}),
      };
    }
    const rides = await db.ride.findMany({
      where,
      orderBy: { departsAt: "asc" },
      include: { driver: true },
    });
    return rides.map((ride) => toDomainRide(ride));
  }

  async listRidesWithRelations(filter?: RideFilter): Promise<RideWithMembers[]> {
    const db = getDb();
    const where: Prisma.RideWhereInput = {};
    if (filter?.destination) {
      where.destination = filter.destination;
    }
    if (filter?.fromSpot) {
      where.fromSpot = filter.fromSpot;
    }
    if (filter?.departsStart || filter?.departsEnd) {
      where.departsAt = {
        ...(filter.departsStart ? { gte: filter.departsStart } : {}),
        ...(filter.departsEnd ? { lt: filter.departsEnd } : {}),
      };
    }
    const rides = await db.ride.findMany({
      where,
      orderBy: { departsAt: "asc" },
      include: { driver: true, members: { include: { user: true } } },
    });
    return rides.map((ride) => toDomainRideWithMembers(ride));
  }

  async createRide(data: {
    driverId: string;
    destination: string;
    fromSpot: string;
    departsAt: Date;
    capacity: number;
    note?: string | undefined;
  }): Promise<Ride> {
    const db = getDb();
    const ride = await db.ride.create({ data, include: { driver: true } });
    return toDomainRide(ride);
  }

  async findRideById(id: number): Promise<Ride | null> {
    const db = getDb();
    const ride = await db.ride.findUnique({ where: { id }, include: { driver: true } });
    return ride ? toDomainRide(ride) : null;
  }

  async deleteRide(id: number): Promise<void> {
    const db = getDb();
    await db.ride.delete({ where: { id } });
  }

  async addRideMember(rideId: number, userId: string): Promise<RideMember> {
    const db = getDb();
    const rec = await db.rideMember.create({ data: { rideId, userId }, include: { user: true } });
    return toDomainRideMember(rec);
  }

  async findRideMember(rideId: number, userId: string): Promise<RideMember | null> {
    const db = getDb();
    const rec = await db.rideMember.findUnique({
      where: { rideId_userId: { rideId, userId } },
      include: { user: true },
    });
    return rec ? toDomainRideMember(rec) : null;
  }

  async verifyRideMember(rideId: number, userId: string, verifiedAt: Date): Promise<RideMember> {
    const db = getDb();
    const rec = await db.rideMember.update({
      where: { rideId_userId: { rideId, userId } },
      data: { verifiedAt },
      include: { user: true },
    });
    return toDomainRideMember(rec);
  }

  async recordRideMemberLocationCheck(
    rideId: number,
    userId: string,
    data: { ip: string; result: boolean | null; checkedAt: Date },
  ): Promise<RideMember> {
    const db = getDb();
    const rec = await db.rideMember.update({
      where: { rideId_userId: { rideId, userId } },
      data: {
        locationCheckIp: data.ip,
        locationCheckResult: data.result,
        locationCheckedAt: data.checkedAt,
      },
      include: { user: true },
    });
    return toDomainRideMember(rec);
  }

  async deleteRideMember(rideId: number, userId: string): Promise<void> {
    const db = getDb();
    await db.rideMember.delete({ where: { rideId_userId: { rideId, userId } } });
  }

  async findRideWithMembers(id: number): Promise<RideWithMembers | null> {
    const db = getDb();
    const ride = await db.ride.findUnique({
      where: { id },
      include: { driver: true, members: { include: { user: true } } },
    });
    return ride ? toDomainRideWithMembers(ride) : null;
  }
}

let _client: DbClient | undefined;
export function getDbClient(): DbClient {
  if (!_client) {
    _client = new PrismaDbClient();
  }
  return _client;
}
