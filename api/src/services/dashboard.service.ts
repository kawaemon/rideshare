import type { DashboardSummary, DashboardRouteStats } from "../domain/dashboard";
import type { DbClient, Ride } from "../lib/db-client";

const STATION_KEYS = ["shonandai", "tsujido"] as const;
const CAMPUS_SPOTS = new Set(["g_parking", "delta_back", "main_cross"]);

interface RouteAggregate {
  earliest: Date | null;
  vehicles: number;
}

type StationKey = (typeof STATION_KEYS)[number];

function isStation(value: string): value is StationKey {
  return (STATION_KEYS as readonly string[]).includes(value);
}

function isCampus(value: string): boolean {
  return CAMPUS_SPOTS.has(value);
}

function emptyAggregate(): RouteAggregate {
  return { earliest: null, vehicles: 0 };
}

function toStats(now: Date, aggregate: RouteAggregate): DashboardRouteStats {
  if (aggregate.vehicles === 0 || !aggregate.earliest) {
    return {
      untilEarliestMin: null,
      vehicles: 0,
    };
  }

  const diffMs = aggregate.earliest.getTime() - now.getTime();
  const minutes = Math.max(0, Math.ceil(diffMs / 60000));

  return {
    untilEarliestMin: minutes,
    vehicles: aggregate.vehicles,
  };
}

function updateAggregate(aggregate: RouteAggregate, ride: Ride): void {
  aggregate.vehicles += 1;
  if (!aggregate.earliest || ride.departsAt < aggregate.earliest) {
    aggregate.earliest = ride.departsAt;
  }
}

export class DashboardService {
  constructor(private readonly db: DbClient) {}

  async getSummary(now: Date = new Date()): Promise<DashboardSummary> {
    const rides = await this.db.listRides({ departsStart: now });

    const toSchool: Record<StationKey, RouteAggregate> = {
      shonandai: emptyAggregate(),
      tsujido: emptyAggregate(),
    };
    const fromSchool: Record<StationKey, RouteAggregate> = {
      shonandai: emptyAggregate(),
      tsujido: emptyAggregate(),
    };

    rides.forEach((ride) => {
      const { destination, fromSpot } = ride;

      if (isStation(fromSpot) && isCampus(destination)) {
        updateAggregate(toSchool[fromSpot], ride);
        return;
      }

      if (isCampus(fromSpot) && isStation(destination)) {
        updateAggregate(fromSchool[destination], ride);
      }
    });

    return {
      toSchool: {
        fromSyonandai: toStats(now, toSchool.shonandai),
        fromTsujido: toStats(now, toSchool.tsujido),
      },
      fromSchool: {
        toSyonandai: toStats(now, fromSchool.shonandai),
        toTsujido: toStats(now, fromSchool.tsujido),
      },
    };
  }
}
