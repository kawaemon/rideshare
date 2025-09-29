-- Added manually: track member location verification attempts
ALTER TABLE "RideMember" ADD COLUMN "locationCheckIp" TEXT;
ALTER TABLE "RideMember" ADD COLUMN "locationCheckResult" TEXT;
ALTER TABLE "RideMember" ADD COLUMN "locationCheckedAt" DATETIME;
