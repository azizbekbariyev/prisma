-- AlterTable
ALTER TABLE "users" ALTER COLUMN "hashed_password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "hashed_refresh_token" SET DATA TYPE VARCHAR(255);
