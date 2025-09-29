/*
  Warnings:

  - You are about to alter the column `locationCheckResult` on the `RideMember` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RideMember" (
    "rideId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    "locationCheckIp" TEXT,
    "locationCheckResult" BOOLEAN,
    "locationCheckedAt" DATETIME,

    PRIMARY KEY ("rideId", "userId"),
    CONSTRAINT "RideMember_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RideMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RideMember" ("joinedAt", "locationCheckIp", "locationCheckResult", "locationCheckedAt", "rideId", "userId", "verifiedAt") SELECT "joinedAt", "locationCheckIp", "locationCheckResult", "locationCheckedAt", "rideId", "userId", "verifiedAt" FROM "RideMember";
DROP TABLE "RideMember";
ALTER TABLE "new_RideMember" RENAME TO "RideMember";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
