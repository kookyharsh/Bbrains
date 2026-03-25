import { UserRole, Sex, TransactionType, TransactionStatus, LeaderboardCategory, LogCategory, ProductApproval } from '@prisma/client';
// @ts-ignore
import prisma from '../src/utils/prisma.js';
// @ts-ignore
import { createSupabaseUser, listSupabaseUsers, deleteSupabaseUser } from '../src/modules/auth/supabase-user.service.js';

declare const process: any;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const walletIdForUserId = (userId: string) => {
  const suffix = userId.split('_')[1] ?? '';
  return `wallet_${suffix || userId}`;
};
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

async function main() {
  console.log("🌱 Starting Seeding Process...");

  try {
    console.log("🧹 Cleaning database...");

    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.streak.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.event.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.transactionHistory.deleteMany();
    await prisma.userAchievements.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.leaderboard.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.product.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.xp.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.userDetails.deleteMany();
    await prisma.userRoles.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    await prisma.college.deleteMany();
    await prisma.level.deleteMany();
    await prisma.course.deleteMany();
    await prisma.address.deleteMany();

    // Clean Supabase Users
    console.log("🧹 Cleaning Supabase auth users...");
    try {
      const users = await listSupabaseUsers({ perPage: 1000 });
      if (users && users.length > 0) {
        for (const u of users) {
          await deleteSupabaseUser(u.id);
        }
      }
    } catch (e: any) {
      console.warn("⚠️ Could not clean up Supabase users. Ignoring if creating fails.", e);
    }

    console.log("✅ Database and Auth cleaned.");

    console.log("🔐 Seeding Permissions...");
    const permissionsList = [
      // Academic
      { name: 'manage_courses', description: 'Can create, update, and delete courses' },
      { name: 'manage_assignments', description: 'Can manage course assignments' },
      { name: 'manage_enrollments', description: 'Can enroll students in courses' },
      { name: 'manage_grades', description: 'Can grade submissions' },
      { name: 'view_submissions', description: 'Can view student submissions' },
      { name: 'manage_submissions', description: 'Can update or delete submissions' },
      { name: 'manage_attendance', description: 'Can mark and view attendance' },
      // Content / Events
      { name: 'manage_announcements', description: 'Can post system-wide announcements' },
      { name: 'manage_suggestions', description: 'Can manage user suggestions' },
      { name: 'create_events', description: 'Can create campus events' },
      { name: 'manage_events', description: 'Can manage all campus events' },
      // Marketplace
      { name: 'manage_products', description: 'Can manage marketplace products' },
      { name: 'approve_products', description: 'Can approve or reject products' },
      { name: 'view_orders', description: 'Can view all orders' },
      { name: 'view_transactions', description: 'Can view financial transactions' },
      // User & Access
      { name: 'manage_users', description: 'Can manage user accounts' },
      { name: 'view_users', description: 'Can view user list' },
      { name: 'manage_roles', description: 'Can create and manage roles' },
      { name: 'manage_permissions', description: 'Can manage role permissions' },
      { name: 'administrator', description: 'Bypass all standard checks' },
      // Profile
      { name: 'manage_displayname', description: 'Can edit own and others display name' },
      { name: 'change_nickname', description: 'Can change their own nickname' },
      // Communication
      { name: 'send_messages', description: 'Can send chat messages' },
      { name: 'manage_messages', description: 'Can delete others messages' },
      { name: 'mention_everyone', description: 'Can use @everyone' },
      { name: 'pin_messages', description: 'Can pin messages' },
      // Finance
      { name: 'view_wallets', description: 'Can view user wallet balances' },
      { name: 'manage_wallets', description: 'Can adjust wallet balances' },
      // System
      { name: 'manage_system_config', description: 'Can manage system configuration' },
      { name: 'view_audit_logs', description: 'Can view system audit logs' },
      { name: 'manage_gamification', description: 'Can manage XP, levels, and achievements' },
    ];

    const createdPermissions = [];
    for (const p of permissionsList) {
      const perm = await prisma.permission.create({ data: p });
      createdPermissions.push(perm);
    }
    console.log(`✅ ${createdPermissions.length} Permissions created.`);

    console.log("📍 Creating addresses...");
    const collegeAddresses = [];
    const addressData = [
      { line1: "123 Tech Avenue", city: "Pune", state: "Maharashtra", postal: "411057" },
      { line1: "456 Business Street", city: "Mumbai", state: "Maharashtra", postal: "400001" },
      { line1: "789 Arts Road", city: "Bangalore", state: "Karnataka", postal: "560001" }
    ];

    for (const addr of addressData) {
      const address = await prisma.address.create({
        data: {
          addressLine1: addr.line1,
          city: addr.city,
          state: addr.state,
          country: "India",
          postalCode: addr.postal
        }
      });
      collegeAddresses.push(address);
    }

    console.log("🎮 Seeding 40 Levels...");
    const levelsData = Array.from({ length: 40 }, (_, i) => ({
      levelNumber: i + 1,
      requiredXp: (i + 1) * 500,
    }));
    await prisma.level.createMany({ data: levelsData });
    console.log("✅ 40 Levels created.");

    console.log("🏫 Seeding Colleges...");
    const colleges = [];
    const collegeNames = ["Learnytics Tech Institute", "Global Business School", "Creative Arts Academy"];

    for (let i = 0; i < collegeNames.length; i++) {
      const col = await prisma.college.create({
        data: {
          name: collegeNames[i],
          email: `admin@${collegeNames[i].replace(/\s/g, '').toLowerCase()}.edu`,
          regNo: `REG-${getRandomInt(1000, 9999)}`,
          addressId: collegeAddresses[i].id
        }
      });
      colleges.push(col);
    }
    console.log(`✅ ${colleges.length} Colleges created.`);

    console.log("👥 Seeding Roles...");
    // Admin roles (rank 10)
    const adminRole = await prisma.role.create({ data: { name: 'Admin', description: 'System Administrator', rank: 10 } });
    const teacherRole = await prisma.role.create({ data: { name: 'Teacher', description: 'Instructor role', rank: 20 } });
    const staffRole = await prisma.role.create({ data: { name: 'Staff', description: 'Support staff', rank: 30 } });
    const studentRole = await prisma.role.create({ data: { name: 'Student', description: 'Student role', rank: 100 } });
    
    const roles = [studentRole, teacherRole, adminRole, staffRole];
    console.log("✅ Default Roles created.");

    // Assign Permissions to Roles
    console.log("🔗 Assigning Permissions to Roles...");
    // Admin gets almost everything
    const adminPerms = createdPermissions.filter(p => p.name !== 'administrator');
    for (const p of adminPerms) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: p.id }
      });
    }

    // Teacher permissions
    const teacherPermNames = ['manage_courses', 'manage_assignments', 'manage_grades', 'view_submissions', 'manage_attendance', 'manage_announcements', 'create_events', 'send_messages', 'mention_everyone'];
    const teacherPerms = createdPermissions.filter(p => teacherPermNames.includes(p.name));
    for (const p of teacherPerms) {
      await prisma.rolePermission.create({
        data: { roleId: teacherRole.id, permissionId: p.id }
      });
    }

    // Student permissions
    const studentPermNames = ['send_messages', 'change_nickname'];
    const studentPerms = createdPermissions.filter(p => studentPermNames.includes(p.name));
    for (const p of studentPerms) {
      await prisma.rolePermission.create({
        data: { roleId: studentRole.id, permissionId: p.id }
      });
    }

    console.log("👥 Seeding Users...");

    const admins: any[] = [];
    const teachers: any[] = [];
    const students: any[] = [];

    async function createUserComplete(supabaseUserId: string, userData: any, detailsData: any, userType: 'admin' | 'teacher' | 'student') {
      const user = await prisma.user.create({
        data: {
          id: supabaseUserId,
          email: userData.email,
          username: userData.username,
          password: userData.password ?? "seed_password_123",
          type: userData.type,
          collegeId: userData.collegeId,
          isSuperAdmin: userData.isSuperAdmin ?? false,
          userDetails: {
            create: {
              firstName: detailsData.firstName,
              lastName: detailsData.lastName,
              sex: detailsData.sex,
              dob: detailsData.dob,
              phone: detailsData.phone,
              addressId: detailsData.addressId || null,
            }
          },
          xp: {
            create: {
              xp: userType === 'student' ? getRandomInt(100, 5000) : getRandomInt(500, 2000),
              level: userType === 'student' ? getRandomInt(1, 10) : getRandomInt(1, 6)
            }
          },
          streak: userType === 'student' ? {
            create: {
              currentStreak: getRandomInt(0, 10),
              lastClaimedAt: new Date(Date.now() - getRandomInt(0, 48) * 60 * 60 * 1000)
            }
          } : undefined
        }
      });

      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {
          balance: userType === 'admin' ? 10000 : userType === 'teacher' ? 5000 : getRandomInt(500, 3000)
        },
        create: {
          id: walletIdForUserId(user.id),
          userId: user.id,
          balance: userType === 'admin' ? 10000 : userType === 'teacher' ? 5000 : getRandomInt(500, 3000)
        }
      });

      return user;
    }

    // Create BBRAINS SUPER ADMIN
    console.log("🌟 Creating BBRAINS SUPER ADMIN (admin@bbrains.co)...");
    const superAdminEmail = "admin@bbrains.co";
    const superSupabaseUser = await createSupabaseUser(superAdminEmail, "superadmin123", {
      username: "bbrains_admin"
    });
    
    const superAdmin = await createUserComplete(
      superSupabaseUser.id,
      {
        email: superAdminEmail,
        username: "bbrains_admin",
        type: UserRole.admin,
        collegeId: colleges[0].id,
        isSuperAdmin: true
      },
      {
        firstName: "BBrains",
        lastName: "Super Admin",
        sex: Sex.male,
        dob: new Date('1990-01-01'),
        phone: "0000000000"
      },
      'admin'
    );
    await prisma.userRoles.create({
      data: { userId: superAdmin.id, roleId: adminRole.id }
    });
    console.log(`    ✅ Super Admin created with ID: ${superAdmin.id}`);

    console.log("  Creating 2 more admins...");
    for (let i = 1; i <= 2; i++) {
      const email = `admin${i}@learnytics.com`;
      const supabaseUser = await createSupabaseUser(email, "admin123", {
        username: `admin_${i}`
      });
      const supabaseUserId = supabaseUser.id;

      const admin = await createUserComplete(
        supabaseUserId,
        {
          email,
          username: `admin_${i}`,
          type: UserRole.admin,
          collegeId: colleges[0].id
        },
        {
          firstName: "College",
          lastName: `Admin ${i}`,
          sex: Sex.male,
          dob: new Date('1990-01-01'),
          phone: `999999999${i}`
        },
        'admin'
      );
      admins.push(admin);

      await prisma.userRoles.create({
        data: { userId: admin.id, roleId: adminRole.id }
      });

      console.log(`    ✅ Admin ${i} created with Supabase ID: ${admin.id}`);
    }

    console.log("  Creating 5 teachers...");
    const teacherNames = ["Snape", "McGonagall", "Flitwick", "Sprout", "Lupin"];
    for (let i = 0; i < 5; i++) {
      const email = `teacher${i + 1}@learnytics.com`;
      const supabaseUser = await createSupabaseUser(email, "teacher123", {
        username: `prof_${teacherNames[i].toLowerCase()}`
      });
      const supabaseUserId = supabaseUser.id;

      const teacher = await createUserComplete(
        supabaseUserId,
        {
          email,
          username: `prof_${teacherNames[i].toLowerCase()}`,
          type: UserRole.teacher,
          collegeId: getRandomItem(colleges).id
        },
        {
          firstName: teacherNames[i],
          lastName: "Professor",
          sex: i % 2 === 0 ? Sex.male : Sex.female,
          dob: new Date('1980-05-20'),
          phone: `888888888${i}`
        },
        'teacher'
      );
      teachers.push(teacher);

      await prisma.userRoles.create({
        data: { userId: teacher.id, roleId: teacherRole.id }
      });

      console.log(`    ✅ Teacher ${i + 1} created with Supabase ID: ${teacher.id}`);
    }

    console.log("  Creating 10 students...");
    const studentNames = ["Harry", "Ron", "Hermione", "Draco", "Luna", "Neville", "Ginny", "Cedric", "Cho", "Viktor"];
    for (let i = 0; i < 10; i++) {
      const email = `student${i + 1}@learnytics.com`;
      const supabaseUser = await createSupabaseUser(email, "student123", {
        username: `student_${studentNames[i].toLowerCase()}`
      });
      const supabaseUserId = supabaseUser.id;

      const studentAddress = await prisma.address.create({
        data: {
          addressLine1: `Hostel Block ${String.fromCharCode(65 + i)}`,
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          postalCode: "400001"
        }
      });

      const student = await createUserComplete(
        supabaseUserId,
        {
          email,
          username: `student_${studentNames[i].toLowerCase()}`,
          type: UserRole.student,
          collegeId: getRandomItem(colleges).id
        },
        {
          firstName: studentNames[i],
          lastName: "Student",
          sex: i % 2 === 0 ? Sex.male : Sex.female,
          dob: new Date('2004-01-01'),
          phone: `777777770${i}`,
          addressId: studentAddress.id
        },
        'student'
      );
      students.push(student);

      await prisma.userRoles.create({
        data: { userId: student.id, roleId: studentRole.id }
      });

      const attendanceDays = 15;
      for (let d = 0; d < attendanceDays; d++) {
        await prisma.attendance.create({
          data: {
            userId: student.id,
            date: new Date(Date.now() - d * 24 * 60 * 60 * 1000),
            status: Math.random() > 0.1 ? "Present" : "Absent"
          }
        });
      }

      console.log(`    ✅ Student ${i + 1} created with Supabase ID: ${student.id}`);
    }

    console.log(`✅ All users created: ${admins.length + 1} admins, ${teachers.length} teachers, ${students.length} students`);

    console.log("📚 Seeding Courses...");
    const courseData = [
      { name: "Potions 101", desc: "Introduction to chemistry and potion making" },
      { name: "Defense Against Dark Arts", desc: "Cybersecurity and ethical hacking basics" },
      { name: "History of Magic", desc: "Database systems and their evolution" },
      { name: "Transfiguration", desc: "Data transformation and ETL processes" },
      { name: "Charms", desc: "Frontend magic with React and TypeScript" }
    ];

    const courses = [];
    for (const c of courseData) {
      const course = await prisma.course.create({
        data: { name: c.name, description: c.desc }
      });
      courses.push(course);

      const enrollCount = getRandomInt(3, Math.min(8, students.length));
      const enrolledStudents = getRandomItems(students, enrollCount);

      for (const s of enrolledStudents) {
        try {
          await prisma.enrollment.create({
            data: {
              userId: s.id,
              courseId: course.id,
              grade: getRandomItem(["A+", "A", "B+", "B", "C"]),
            }
          });
        } catch (e: any) { }
      }
    }
    console.log(`✅ ${courses.length} Courses created.`);

    console.log("📝 Seeding Assignments...");
    const assignments = [];
    for (let i = 0; i < 15; i++) {
      const course = getRandomItem(courses);
      const assign = await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: `${course.name} - Assignment ${i + 1}`,
          description: `Complete chapter ${i + 1} exercises.`,
          dueDate: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000),
        }
      });
      assignments.push(assign);
    }
    console.log(`✅ ${assignments.length} Assignments created.`);

    console.log("✏️ Seeding Submissions & Grades...");
    let submissionCount = 0;
    for (const assign of assignments) {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: assign.courseId },
        include: { user: true }
      });

      const submitters = getRandomItems(
        enrollments.map((e: any) => e.user),
        Math.max(1, Math.ceil(enrollments.length / 1.5))
      );

      for (const student of (submitters as any[])) {
        try {
          await prisma.submission.create({
            data: {
              assignmentId: assign.id,
              userId: student.id,
              filePath: `/uploads/${student.username}_assignment.pdf`,
            }
          });

          await prisma.grade.create({
            data: {
              assignmentId: assign.id,
              userId: student.id,
              grade: getRandomItem(["A+", "A", "B+", "B", "C"]),
              gradedBy: getRandomItem(teachers).username
            }
          });
          submissionCount++;
        } catch (e: any) { }
      }
    }
    console.log(`✅ ${submissionCount} Submissions & Grades created.`);

    console.log("🛍️ Seeding Products...");
    const productData = [
      { name: "Invisibility Cloak", desc: "Premium stealth device", price: 500, stock: 5 },
      { name: "Elder Wand", desc: "Most powerful wand", price: 1000, stock: 1 },
      { name: "Firebolt Broomstick", desc: "Fastest broom", price: 800, stock: 3 },
      { name: "Marauder's Map", desc: "See everyone", price: 300, stock: 10 },
      { name: "Time Turner", desc: "Go back in time", price: 1500, stock: 2 },
      { name: "Pensieve", desc: "Store memories", price: 700, stock: 4 },
      { name: "Remembrall", desc: "Memory reminder", price: 150, stock: 15 },
    ];

    const products = [];
    for (const p of productData) {
      const prod = await prisma.product.create({
        data: {
          name: p.name,
          description: p.desc,
          price: p.price,
          stock: p.stock,
          creatorId: getRandomItem(teachers).id,
          image: `https://placehold.co/400?text=${encodeURIComponent(p.name)}`,
          approval: ProductApproval.approved
        }
      });
      products.push(prod);
    }
    console.log(`✅ ${products.length} Products created.`);

    console.log("🎨 Seeding Theme Products...");
    const themeData = [
      { 
        name: "Hand-Drawn Theme", 
        desc: "Creative hand-drawn aesthetic with paper texture and sketchy elements", 
        price: 150, 
        stock: 999,
        metadata: {
          category: 'theme',
          themeConfig: {
            id: 'hand-drawn',
            name: 'Hand-Drawn',
            variables: {
              '--background': '#fdfbf7',
              '--foreground': '#2d2d2d',
              '--card': '#fdfbf7',
              '--card-foreground': '#2d2d2d',
              '--popover': '#fdfbf7',
              '--popover-foreground': '#2d2d2d',
              '--primary': '#55E6C1',
              '--primary-foreground': '#2d2d2d',
              '--secondary': '#e5e0d8',
              '--secondary-foreground': '#2d2d2d',
              '--muted': '#f5f5f0',
              '--muted-foreground': '#636E72',
              '--accent': '#ff4d4d',
              '--accent-foreground': '#ffffff',
              '--destructive': '#ff4d4d',
              '--border': '#e5e0d8',
              '--input': '#ffffff',
              '--ring': '#2d2d2d',
              '--chart-1': '#ff4d4d',
              '--chart-2': '#2d5da1',
              '--chart-3': '#55E6C1',
              '--chart-4': '#f9ca24',
              '--chart-5': '#f39c12'
            }
          }
        }
      }
    ];

    const themes = [];
    for (const t of themeData) {
      const theme = await prisma.product.create({
        data: {
          name: t.name,
          description: t.desc,
          price: t.price,
          stock: t.stock,
          creatorId: getRandomItem(teachers).id,
          image: `https://placehold.co/400/6C5CE7/FFFFFF?text=${encodeURIComponent(t.name.split(' ')[0])}`,
          approval: ProductApproval.approved,
          metadata: t.metadata
        }
      });
      themes.push(theme);
    }
    console.log(`✅ ${themes.length} Theme products created.`);

    console.log("🛒 Seeding Carts & Orders...");
    let cartCount = 0;
    let orderCount = 0;
    for (const student of students) {
      const cartItemsCount = getRandomInt(1, 3);
      const cartProducts = getRandomItems(products, cartItemsCount);
      for (const prod of cartProducts) {
        try {
          await prisma.cart.create({
            data: {
              userId: student.id,
              productId: prod.id,
              quantity: getRandomInt(1, 2),
              price: prod.price
            }
          });
          cartCount++;
        } catch (e: any) { }
      }

      if (Math.random() > 0.5) {
        const orderItemsCount = getRandomInt(1, 4);
        const orderProducts = getRandomItems(products, orderItemsCount);
        let total = 0;
        const items = orderProducts.map(p => {
          const qty = getRandomInt(1, 2);
          total += Number(p.price) * qty;
          return { productId: p.id, quantity: qty, price: p.price };
        });

        await prisma.order.create({
          data: {
            userId: student.id,
            status: getRandomItem(["completed", "pending", "shipped"]),
            totalAmount: total,
            items: {
              create: items
            }
          }
        });
        orderCount++;
      }
    }
    console.log(`✅ ${cartCount} Cart items and ${orderCount} Orders created.`);

    console.log("📢 Seeding Announcements...");
    const announcements = [
      { title: "Welcome to BBrains!", desc: "Start earning XP and climb the leaderboard today!" },
      { title: "Mid-Term Projects", desc: "Check your assignments section for upcoming project deadlines." },
      { title: "Marketplace Expansion", desc: "New magical items have been added to the marketplace. Buy now!" },
      { title: "System Maintenance", desc: "The portal will be down for maintenance this Sunday from 2 AM to 4 AM." },
    ];

    for (const a of announcements) {
      await prisma.announcement.create({
        data: {
          userId: superAdmin.id,
          title: a.title,
          description: a.desc,
        }
      });
    }
    console.log(`✅ ${announcements.length} Announcements created.`);

    console.log("📅 Seeding Events...");
    const eventData = [
      { title: "Triwizard Tournament", description: "The legendary magical contest between three schools.", type: "Tournament", location: "Hogwarts Stadium" },
      { title: "Yule Ball", description: "A formal Christmas celebration and dance.", type: "Social", location: "Great Hall" },
    ];

    for (const e of eventData) {
      const start = new Date(Date.now() + getRandomInt(-10, 30) * 24 * 60 * 60 * 1000);
      await prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          type: e.type,
          location: e.location,
          startDate: start,
          endDate: new Date(start.getTime() + 4 * 60 * 60 * 1000),
          date: start,
          banner: `https://placehold.co/800x400?text=${encodeURIComponent(e.title)}`
        }
      });
    }
    console.log(`✅ ${eventData.length} Events created.`);

    console.log("\n" + "=".repeat(70));
    console.log("✅ ✅ ✅ BBRAINS SEEDING COMPLETED SUCCESSFULLY! ✅ ✅ ✅");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  • ${createdPermissions.length} Permissions`);
    console.log(`  • ${colleges.length} Colleges`);
    console.log(`  • ${admins.length + 1} Admins (including SUPER ADMIN)`);
    console.log(`  • ${teachers.length} Teachers`);
    console.log(`  • ${students.length} Students`);
    (process as any).exit(0);

  } catch (error) {
    console.error("\n❌ SEEDING FAILED:");
    console.error(error);
    (process as any).exit(1);
  }
}

main()
  .catch((e: any) => {
    console.error("❌ Fatal error:", e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
