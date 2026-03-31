import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.blackoutDate.deleteMany();
  await prisma.dockSchedule.deleteMany();
  await prisma.dock.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const staffPassword = await bcrypt.hash("password123", 12);
  const carrierPassword = await bcrypt.hash("password123", 12);

  const staff = await prisma.user.create({
    data: {
      name: "Warehouse Manager",
      email: "staff@warehouse.com",
      hashedPassword: staffPassword,
      role: "STAFF",
    },
  });

  const carrier = await prisma.user.create({
    data: {
      name: "John Driver",
      email: "carrier@example.com",
      hashedPassword: carrierPassword,
      role: "CARRIER",
      company: "ABC Trucking Co.",
      phone: "555-0100",
    },
  });

  console.log("Created users:", staff.email, carrier.email);

  // Create docks
  const dockA = await prisma.dock.create({
    data: { name: "Dock A", description: "Main receiving dock - west side", isActive: true },
  });
  const dockB = await prisma.dock.create({
    data: { name: "Dock B", description: "Shipping dock - east side", isActive: true },
  });
  const dockC = await prisma.dock.create({
    data: { name: "Dock C", description: "Overflow dock - north side", isActive: true },
  });

  console.log("Created docks:", dockA.name, dockB.name, dockC.name);

  // Create schedules Mon-Fri for each dock
  const docks = [dockA, dockB, dockC];
  const workDays = [1, 2, 3, 4, 5]; // Mon-Fri

  for (const dock of docks) {
    for (const dayOfWeek of workDays) {
      await prisma.dockSchedule.create({
        data: {
          dockId: dock.id,
          dayOfWeek,
          openTime: "08:00",
          closeTime: "17:00",
          slotDurationMins: 60,
          isActive: true,
        },
      });
    }
  }

  console.log("Created schedules for Mon-Fri, 08:00-17:00, 60-min slots");
  console.log("\nSeed complete!");
  console.log("---");
  console.log("Staff login:   staff@warehouse.com / password123");
  console.log("Carrier login: carrier@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
