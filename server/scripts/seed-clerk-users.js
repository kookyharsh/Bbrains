import dotenv from "dotenv";
import { createClerkClient } from "@clerk/backend";
import prisma from "../utils/prisma.js";

dotenv.config();

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error("CLERK_SECRET_KEY is missing in server/.env");
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

const TEST_PASSWORD = "Bbrains 1691";

const TEST_USERS = [
  {
    email: "student1.test@bbrains.dev",
    username: "student_test_1",
    firstName: "Student",
    lastName: "One",
    type: "student",
  },
  {
    email: "student2.test@bbrains.dev",
    username: "student_test_2",
    firstName: "Student",
    lastName: "Two",
    type: "student",
  },
  {
    email: "student3.test@bbrains.dev",
    username: "student_test_3",
    firstName: "Student",
    lastName: "Three",
    type: "student",
  },
  {
    email: "teacher1.test@bbrains.dev",
    username: "teacher_test_1",
    firstName: "Teacher",
    lastName: "One",
    type: "teacher",
  },
  {
    email: "teacher2.test@bbrains.dev",
    username: "teacher_test_2",
    firstName: "Teacher",
    lastName: "Two",
    type: "teacher",
  },
  {
    email: "admin1.test@bbrains.dev",
    username: "admin_test_1",
    firstName: "Admin",
    lastName: "One",
    type: "admin",
  },
];

const ROLE_NAME_BY_TYPE = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

async function ensureWalletTriggerCompatible() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'wallet'
      AND column_name = 'wallet_id'
    LIMIT 1
  `);

  const walletIdType = rows?.[0]?.data_type;

  if (walletIdType === "integer") {
    // Older schema variant: wallet_id is SERIAL/INTEGER. Let DB default generate it.
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION create_user_wallet_func()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO "wallet" ("user_id", "balance", "pin")
        VALUES (NEW."user_id", 500.00, '000000')
        ON CONFLICT ("user_id") DO NOTHING;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    return;
  }

  // Newer schema variant: wallet_id is TEXT and must be provided.
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION create_user_wallet_func()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO "wallet" ("wallet_id", "user_id", "balance", "pin")
      VALUES ('wallet_' || split_part(NEW."user_id", '_', 2), NEW."user_id", 500.00, '000000')
      ON CONFLICT ("user_id") DO NOTHING;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

async function getOrCreateCollegeId() {
  const existing = await prisma.college.findFirst({ select: { id: true } });
  if (existing) return existing.id;

  const address = await prisma.address.create({
    data: {
      addressLine1: "100 Test Campus Road",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      postalCode: "411001",
    },
  });

  const college = await prisma.college.create({
    data: {
      name: "Bbrains Test College",
      email: "admin@testcollege.bbrains.dev",
      regNo: `TEST-${Date.now()}`,
      addressId: address.id,
    },
    select: { id: true },
  });

  return college.id;
}

async function ensureBaseRoles() {
  await prisma.role.upsert({
    where: { name: "Student" },
    update: {},
    create: { name: "Student", description: "Student role" },
  });
  await prisma.role.upsert({
    where: { name: "Teacher" },
    update: {},
    create: { name: "Teacher", description: "Teacher role" },
  });
  await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "System administrator role" },
  });
}

async function getOrCreateClerkUser(user) {
  const list = await clerkClient.users.getUserList({
    emailAddress: [user.email],
    limit: 1,
  });
  const existing = list.data?.[0];
  if (existing) return existing;

  return clerkClient.users.createUser({
    emailAddress: [user.email],
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    password: TEST_PASSWORD,
    skipPasswordChecks: true,
  });
}

async function syncUserToPrisma(clerkUser, user, collegeId) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, email: true },
  });

  if (existingByEmail && existingByEmail.id !== clerkUser.id) {
    throw new Error(
      `Email ${user.email} already exists in DB with id ${existingByEmail.id}. Remove it before syncing to Clerk id ${clerkUser.id}.`
    );
  }

  const dbUser = await prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email: user.email,
      username: user.username,
      type: user.type,
      collegeId,
    },
    create: {
      id: clerkUser.id,
      email: user.email,
      username: user.username,
      type: user.type,
      // Compatibility for DBs where user.password is still NOT NULL
      password: TEST_PASSWORD,
      collegeId,
      userDetails: {
        create: {
          firstName: user.firstName,
          lastName: user.lastName,
          sex: "other",
          dob: new Date("2004-01-01"),
          phone: null,
          avatar: clerkUser.imageUrl || null,
        },
      },
    },
    select: { id: true, type: true },
  });

  await prisma.userDetails.upsert({
    where: { userId: dbUser.id },
    update: {
      firstName: user.firstName,
      lastName: user.lastName,
      sex: "other",
      avatar: clerkUser.imageUrl || null,
    },
    create: {
      userId: dbUser.id,
      firstName: user.firstName,
      lastName: user.lastName,
      sex: "other",
      dob: new Date("2004-01-01"),
      phone: null,
      avatar: clerkUser.imageUrl || null,
    },
  });

  await prisma.xp.upsert({
    where: { userId: dbUser.id },
    update: {},
    create: { userId: dbUser.id, xp: 0, level: 1 },
  });

  if (user.type === "student") {
    await prisma.streak.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: { userId: dbUser.id, currentStreak: 0 },
    });
  }

  const roleName = ROLE_NAME_BY_TYPE[user.type];
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    select: { id: true },
  });
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  await prisma.userRoles.upsert({
    where: {
      userId_roleId: { userId: dbUser.id, roleId: role.id },
    },
    update: {},
    create: { userId: dbUser.id, roleId: role.id },
  });

  await clerkClient.users.updateUser(clerkUser.id, {
    publicMetadata: {
      role: user.type,
      testAccount: true,
    },
  });
}

async function main() {
  console.log("Seeding Clerk + Prisma test users...");
  console.log(`Default test password: ${TEST_PASSWORD}`);

  await ensureWalletTriggerCompatible();
  const collegeId = await getOrCreateCollegeId();
  await ensureBaseRoles();

  for (const user of TEST_USERS) {
    const clerkUser = await getOrCreateClerkUser(user);
    await syncUserToPrisma(clerkUser, user, collegeId);
    console.log(`OK ${user.type}: ${user.email} (${clerkUser.id})`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Failed to seed Clerk test users");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
