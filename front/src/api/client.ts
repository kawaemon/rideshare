// Simple switchable API client. For hackathon, mock is default.
import * as mock from "./mock";
export * from "./types";

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK !== "0"; // default true

// Future: add real fetch implementation and toggle by VITE_USE_MOCK=0

export const api = {
  listRides: mock.listRides,
  createRide: mock.createRide,
  getRide: mock.getRide,
  joinRide: mock.joinRide,
  leaveRide: mock.leaveRide,
  deleteRide: mock.deleteRide,
  listMyRides: mock.listMyRides,
};

export function isMock() {
  return USE_MOCK;
}

