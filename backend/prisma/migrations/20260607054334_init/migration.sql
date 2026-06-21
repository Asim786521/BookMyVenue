-- AlterTable
ALTER TABLE "auth_tokens" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "booking_history" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venue_approval_logs" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venue_images" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venue_slots" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venues" ALTER COLUMN "id" DROP DEFAULT;
