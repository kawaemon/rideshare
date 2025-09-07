import { getDb } from "./db";

// Domain types (Prisma-independent)
export type User = { id: string };
export type RideMember = { rideId: number; userId: string };
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
  findRideById(
    id: number,
    opts?: { withMembers?: boolean },
  ): Promise<Ride | RideWithMembers | null>;
  deleteRide(id: number): Promise<void>;

  // Ride members
  addRideMember(rideId: number, userId: string): Promise<RideMember>;
  findRideMember(rideId: number, userId: string): Promise<RideMember | null>;
  deleteRideMember(rideId: number, userId: string): Promise<void>;
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
    const where: any = {};
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
    return rides;
  }

  async listRidesWithRelations(filter?: RideFilter): Promise<RideWithMembers[]> {
    const db = getDb();
    const where: any = {};
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
      include: { driver: true, members: true },
    });
    return rides as unknown as RideWithMembers[];
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
    return ride as unknown as Ride;
  }

  async findRideById(
    id: number,
    opts?: { withMembers?: boolean },
  ): Promise<Ride | RideWithMembers | null> {
    const db = getDb();
    const ride = await db.ride.findUnique({
      where: { id },
      include: { driver: true, members: Boolean(opts?.withMembers) },
    });
    return ride as unknown as Ride | RideWithMembers | null;
  }

  async deleteRide(id: number): Promise<void> {
    const db = getDb();
    await db.ride.delete({ where: { id } });
  }

  async addRideMember(rideId: number, userId: string): Promise<RideMember> {
    const db = getDb();
    const rec = await db.rideMember.create({ data: { rideId, userId } });
    return rec as unknown as RideMember;
  }

  async findRideMember(rideId: number, userId: string): Promise<RideMember | null> {
    const db = getDb();
    const rec = await db.rideMember.findUnique({ where: { rideId_userId: { rideId, userId } } });
    return rec as unknown as RideMember | null;
  }

  async deleteRideMember(rideId: number, userId: string): Promise<void> {
    const db = getDb();
    await db.rideMember.delete({ where: { rideId_userId: { rideId, userId } } });
  }
}

let _client: DbClient | undefined;
export function getDbClient(): DbClient {
  if (!_client) {
    _client = new PrismaDbClient();
  }
  return _client;
}
