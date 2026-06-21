CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('USER', 'VENUE_OWNER', 'ADMIN');
CREATE TYPE "VenueStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "venues" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "pincode" text NOT NULL,
  "capacity" integer NOT NULL,
  "price" decimal(12,2) NOT NULL,
  "amenities" text[] NOT NULL,
  "status" "VenueStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "venue_images" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "venue_id" uuid NOT NULL,
  "url" text,
  "bytes" bytea,
  "mime_type" text,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "venue_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "venue_slots" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "venue_id" uuid NOT NULL,
  "label" text NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "venue_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "venue_id" uuid NOT NULL,
  "slot_id" uuid NOT NULL,
  "date" date NOT NULL,
  "amount" decimal(12,2) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "transaction_id" text,
  "razorpay_order_id" text,
  "amount" decimal(12,2) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "booking_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "status" "BookingStatus" NOT NULL,
  "note" text,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "booking_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_tokens" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "refresh_token" text NOT NULL,
  "expires_at" timestamp(3) NOT NULL,
  "revoked_at" timestamp(3),
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "venue_approval_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "venue_id" uuid NOT NULL,
  "admin_id" uuid NOT NULL,
  "status" "VenueStatus" NOT NULL,
  "reason" text,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  CONSTRAINT "venue_approval_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "venues_city_status_idx" ON "venues"("city", "status");
CREATE UNIQUE INDEX "venue_slots_venue_id_start_time_end_time_key" ON "venue_slots"("venue_id", "start_time", "end_time");
CREATE INDEX "bookings_venue_id_date_slot_id_idx" ON "bookings"("venue_id", "date", "slot_id");
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");
CREATE UNIQUE INDEX "bookings_active_slot_unique_idx" ON "bookings"("venue_id", "date", "slot_id") WHERE "status" IN ('PENDING_PAYMENT', 'CONFIRMED');
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");
CREATE UNIQUE INDEX "auth_tokens_refresh_token_key" ON "auth_tokens"("refresh_token");

ALTER TABLE "venues" ADD CONSTRAINT "venues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "venue_images" ADD CONSTRAINT "venue_images_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "venue_slots" ADD CONSTRAINT "venue_slots_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "venue_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking_history" ADD CONSTRAINT "booking_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "venue_approval_logs" ADD CONSTRAINT "venue_approval_logs_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
