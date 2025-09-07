import type { RideWithMembers } from "../lib/db-client";

export type DomainResult<T = true> = { ok: true; data: T } | { ok: false; error: string };

// Business rules related to ride membership
export function canJoin(ride: RideWithMembers, userId: string): DomainResult {
  if (ride.members.length >= ride.capacity) {
    return { ok: false, error: "full" };
  }
  if (ride.members.some((m) => m.userId === userId)) {
    return { ok: false, error: "already_joined" };
  }
  return { ok: true, data: true };
}
