import { prisma } from "../src/config/prisma";
import { hashPassword } from "../src/utils/password";
import { Roles, VenueStatuses } from "../src/types/domain";

async function main() {
  const passwordHash = await hashPassword("Password123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookmyvenue.test" },
    update: {},
    create: { name: "Admin", email: "admin@bookmyvenue.test", passwordHash, role: Roles.ADMIN }
  });
  const owner = await prisma.user.upsert({
    where: { email: "owner@bookmyvenue.test" },
    update: {},
    create: { name: "Venue Owner", email: "owner@bookmyvenue.test", passwordHash, role: Roles.VENUE_OWNER }
  });
  await prisma.user.upsert({
    where: { email: "user@bookmyvenue.test" },
    update: {},
    create: { name: "Demo User", email: "user@bookmyvenue.test", passwordHash, role: Roles.USER }
  });

  const venue = await prisma.venue.create({
    data: {
      ownerId: owner.id,
      name: "Community Grand Hall",
      description: "A practical hall for community events, workshops, and celebrations.",
      address: "12 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      capacity: 250,
      price: 25000,
      amenities: ["AC", "Parking", "Wifi", "Stage"],
      status: VenueStatuses.APPROVED,
      approvals: { create: { adminId: admin.id, status: VenueStatuses.APPROVED, reason: "Seed venue" } },
      slots: {
        createMany: {
          data: [
            { label: "9AM-12PM", startTime: "09:00", endTime: "12:00" },
            { label: "1PM-4PM", startTime: "13:00", endTime: "16:00" },
            { label: "5PM-9PM", startTime: "17:00", endTime: "21:00" }
          ]
        }
      }
    }
  });

  console.log({ admin: admin.email, owner: owner.email, venue: venue.name, password: "Password123!" });
}

main().finally(async () => prisma.$disconnect());
