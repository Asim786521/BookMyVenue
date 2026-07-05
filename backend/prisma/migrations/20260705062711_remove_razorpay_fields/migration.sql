/*
  Warnings:

  - You are about to drop the column `razorpay_order_id` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "razorpay_order_id",
ADD COLUMN     "stripe_payment_intent_id" TEXT;
