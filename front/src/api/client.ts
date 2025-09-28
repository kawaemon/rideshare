import * as rest from "./rest";
export * from "./types";

// Real API client only. Mock removed.
export const api = {
  listRides: rest.listRides,
  createRide: rest.createRide,
  getRide: rest.getRide,
  joinRide: rest.joinRide,
  leaveRide: rest.leaveRide,
  deleteRide: rest.deleteRide,
  listMyRides: rest.listMyRides,
  ensureUser: rest.ensureUser,
  verifyRideMember: rest.verifyRideMember,
};
