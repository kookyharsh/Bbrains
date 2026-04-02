import { UserRole, Sex, TransactionType, TransactionStatus, LeaderboardCategory, LogCategory, ProductApproval } from '@prisma/client';
// @ts-ignore
import prisma from '../src/utils/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

declare const process: any;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// FIX: Supabase user IDs are plain UUIDs (no underscores), so the old split('_')[1]
// always returned undefined → every wallet got id "wallet_", causing PK conflicts.
const walletIdForUserId = (userId: string) => `wallet_${userId}`;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

// Silently skips if the table doesn't exist yet (P2021 = table not found).
// This lets the seed run cleanly even when not all migrations have been applied.
async function safeDeleteMany(model: { deleteMany: () => Promise<any> }, name: string) {
  try {
    await model.deleteMany();
  } catch (e: any) {
    if (e?.code === 'P2021') {
      console.warn(`  ⚠️  Skipping ${name} — table does not exist yet.`);
    } else {
      throw e;
    }
  }
}

async function main() {
  console.log("🌱 Starting Seeding Process...");

  try {
    console.log("🧹 Cleaning database...");

    // Rule: children before parents; models referencing a table must be deleted first.

    // Chat / social (reference user)
    await safeDeleteMany(prisma.chatMessage,    'ChatMessage');
    await safeDeleteMany(prisma.notification,   'Notification');
    await safeDeleteMany(prisma.suggestion,     'Suggestion');
    await safeDeleteMany(prisma.userPreference, 'UserPreference');

    // Streaks / attendance (reference user)
    await safeDeleteMany(prisma.streak,     'Streak');
    await safeDeleteMany(prisma.attendance, 'Attendance');

    // Assessment results → assessments (reference course + user)
    await safeDeleteMany(prisma.assessmentResult, 'AssessmentResult');
    await safeDeleteMany(prisma.assessment,       'Assessment');

    // Academic
    await safeDeleteMany(prisma.submission, 'Submission');
    await safeDeleteMany(prisma.grade,      'Grade');
    await safeDeleteMany(prisma.enrollment, 'Enrollment');
    await safeDeleteMany(prisma.assignment, 'Assignment');

    // Marketplace — library before product, cart/orderItem before order/product
    await safeDeleteMany(prisma.library,   'Library');
    await safeDeleteMany(prisma.cart,      'Cart');
    await safeDeleteMany(prisma.orderItem, 'OrderItem');
    await safeDeleteMany(prisma.order,     'Order');
    await safeDeleteMany(prisma.product,   'Product');

    // Misc
    await safeDeleteMany(prisma.transactionHistory, 'TransactionHistory');
    await safeDeleteMany(prisma.userAchievements,   'UserAchievements');
    await safeDeleteMany(prisma.achievement,        'Achievement');
    await safeDeleteMany(prisma.leaderboard,        'Leaderboard');
    await safeDeleteMany(prisma.announcement,       'Announcement');
    await safeDeleteMany(prisma.auditLog,           'AuditLog');
    await safeDeleteMany(prisma.event,              'Event');

    // User-level (xp, wallet, details, roles before user)
    await safeDeleteMany(prisma.xp,          'Xp');
    await safeDeleteMany(prisma.wallet,      'Wallet');
    await safeDeleteMany(prisma.userDetails, 'UserDetails');
    await safeDeleteMany(prisma.userRoles,   'UserRoles');
    await safeDeleteMany(prisma.role,        'Role');

    // Course after user (classTeacherId is SetNull so safe, but enrollment already gone)
    await safeDeleteMany(prisma.course, 'Course');

    // User + college + address last
    await safeDeleteMany(prisma.user,    'User');
    await safeDeleteMany(prisma.college, 'College');
    await safeDeleteMany(prisma.level,   'Level');
    await safeDeleteMany(prisma.address, 'Address');

    console.log("✅ Database cleaned.");

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
    const roles = await Promise.all([
      prisma.role.create({ data: { name: 'Student', description: 'Student role' } }),
      prisma.role.create({ data: { name: 'Teacher', description: 'Instructor role' } }),
      prisma.role.create({ data: { name: 'Admin', description: 'System Administrator' } }),
      prisma.role.create({ data: { name: 'Super Admin', description: 'BBrains Super Administrator' } }),
    ]);
    console.log("✅ 4 Roles created.");

    console.log("👥 Seeding Users...");

    const studentRole = roles[0];
    const teacherRole = roles[1];
    const adminRole = roles[2];
    const superAdminRole = roles[3];
    const superAdmins: any[] = [];
    const admins: any[] = [];
    const teachers: any[] = [];
    const students: any[] = [];

    async function createUserComplete(userData: any, detailsData: any, userType: 'admin' | 'teacher' | 'student') {
      const userId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(userData.password || "seed_password_123", 10);

      const user = await prisma.user.create({
        data: {
          id: userId,
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          type: userData.type,
          collegeId: userData.collegeId,
          userDetails: {
            create: {
              firstName: detailsData.firstName,
              lastName: detailsData.lastName,
              sex: detailsData.sex,
              dob: detailsData.dob,
              phone: detailsData.phone,
              addressId: detailsData.addressId || null,
              teacherSubjects: detailsData.teacherSubjects,
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

    console.log("  Creating 1 super admin...");
    {
      const email = "superadmin@bbrains.com";
      const superAdmin = await createUserComplete(
        {
          email,
          username: "super_admin",
          password: "superadmin123",
          type: UserRole.superadmin,
          collegeId: colleges[0].id
        },
        {
          firstName: "BBrains",
          lastName: "Super Admin",
          sex: Sex.female,
          dob: new Date('1988-01-01'),
          phone: "9999999990"
        },
        'admin'
      );
      superAdmins.push(superAdmin);

      await prisma.userRoles.create({
        data: { userId: superAdmin.id, roleId: superAdminRole.id }
      });

      console.log(`    ✅ Super admin created: ${superAdmin.id}`);
    }

    console.log("  Creating 2 admins...");
    for (let i = 1; i <= 2; i++) {
      const email = `admin${i}@learnytics.com`;

      const admin = await createUserComplete(
        {
          email,
          username: `admin_${i}`,
          password: "admin123",
          type: UserRole.admin,
          collegeId: colleges[0].id
        },
        {
          firstName: "Super",
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

      console.log(`    ✅ Admin ${i} created: ${admin.id}`);
    }

    console.log("  Creating 5 teachers...");
    const teacherProfiles = [
      {
        firstName: "Aarav",
        lastName: "Sharma",
        username: "teacher_aarav",
        sex: Sex.male,
        collegeId: colleges[0].id,
        teacherSubjects: ["English", "Physics", "Chemistry"],
      },
      {
        firstName: "Meera",
        lastName: "Iyer",
        username: "teacher_meera",
        sex: Sex.female,
        collegeId: colleges[0].id,
        teacherSubjects: ["Mathematics", "Biology", "Computer Science"],
      },
      {
        firstName: "Rohan",
        lastName: "Patel",
        username: "teacher_rohan",
        sex: Sex.male,
        collegeId: colleges[0].id,
        teacherSubjects: ["Accountancy", "Business Studies", "Economics"],
      },
      {
        firstName: "Nisha",
        lastName: "Kapoor",
        username: "teacher_nisha",
        sex: Sex.female,
        collegeId: colleges[1].id,
        teacherSubjects: ["History", "Political Science"],
      },
      {
        firstName: "Vikram",
        lastName: "Reddy",
        username: "teacher_vikram",
        sex: Sex.male,
        collegeId: colleges[2].id,
        teacherSubjects: ["Art", "Design Fundamentals"],
      }
    ];
    for (let i = 0; i < teacherProfiles.length; i++) {
      const teacherProfile = teacherProfiles[i];
      const email = `teacher${i + 1}@learnytics.com`;

      const teacher = await createUserComplete(
        {
          email,
          username: teacherProfile.username,
          password: "teacher123",
          type: UserRole.teacher,
          collegeId: teacherProfile.collegeId
        },
        {
          firstName: teacherProfile.firstName,
          lastName: teacherProfile.lastName,
          sex: teacherProfile.sex,
          dob: new Date('1980-05-20'),
          phone: `888888888${i}`,
          teacherSubjects: teacherProfile.teacherSubjects
        },
        'teacher'
      );
      teachers.push(teacher);

      await prisma.userRoles.create({
        data: { userId: teacher.id, roleId: teacherRole.id }
      });

      console.log(`    ✅ Teacher ${i + 1} created: ${teacher.id}`);
    }

    console.log("  Creating 10 students...");
    const studentNames = ["Harry", "Ron", "Hermione", "Draco", "Luna", "Neville", "Ginny", "Cedric", "Cho", "Viktor"];
    for (let i = 0; i < 10; i++) {
      const email = `student${i + 1}@learnytics.com`;

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
        {
          email,
          username: `student_${studentNames[i].toLowerCase()}`,
          password: "student123",
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

      console.log(`    ✅ Student ${i + 1} created: ${student.id}`);
    }

    console.log(`✅ All users created: ${superAdmins.length} super admins, ${admins.length} admins, ${teachers.length} teachers, ${students.length} students`);

    console.log("📚 Seeding Courses...");

    const courseData = [
      {
        name: "11th",
        desc: "Senior secondary science class for 11th standard.",
        standard: "11th",
        subjects: ["English", "Physics", "Chemistry"],
        classTeacherId: teachers[0].id
      },
      {
        name: "12th",
        desc: "Senior secondary science class for 12th standard.",
        standard: "12th",
        subjects: ["Mathematics", "Biology", "Computer Science"],
        classTeacherId: teachers[1].id
      },
      {
        name: "Commerce",
        desc: "Commerce stream class with core business subjects.",
        standard: "Commerce",
        subjects: ["Accountancy", "Business Studies", "Economics"],
        classTeacherId: teachers[2].id
      }
    ];

    const courses = [];
    for (const c of courseData) {
      const course = await prisma.course.create({
        data: {
          name: c.name,
          description: c.desc,
          standard: c.standard,
          feePerStudent: 25000,
          durationValue: 12,
          durationUnit: 'months',
          studentCapacity: 40,
          classTeacherId: c.classTeacherId,
          subjects: c.subjects
        }
      });
      courses.push(course);
    }

    for (let i = 0; i < students.length; i++) {
      const assignedCourse = courses[i % courses.length];
      try {
        await prisma.enrollment.create({
          data: {
            userId: students[i].id,
            courseId: assignedCourse.id,
            grade: getRandomItem(["A+", "A", "B+", "B", "C"]),
          }
        });
      } catch (e: any) { }
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
      },
      {
        name: "Vibrant Orange Theme",
        desc: "Energetic theme based on brand orange color",
        price: 200,
        stock: 999,
        metadata: {
          category: 'theme',
          themeConfig: {
            id: 'brand-orange',
            name: 'Vibrant Orange',
            variables: {
              '--background': '#FFF5F5',
              '--foreground': '#2F3640',
              '--card': '#FFFFFF',
              '--card-foreground': '#2F3640',
              '--popover': '#FFF5F5',
              '--popover-foreground': '#2F3640',
              '--primary': '#FF7675',
              '--primary-foreground': '#FFFFFF',
              '--secondary': '#FED7D7',
              '--secondary-foreground': '#2F3640',
              '--muted': '#FADBD8',
              '--muted-foreground': '#636E72',
              '--accent': '#F39C12',
              '--accent-foreground': '#FFFFFF',
              '--destructive': '#E74C3C',
              '--border': '#E8DAEF',
              '--input': '#FFFFFF',
              '--ring': '#FF7675',
              '--chart-1': '#FF7675',
              '--chart-2': '#E74C3C',
              '--chart-3': '#F39C12',
              '--chart-4': '#FAB1A0',
              '--chart-5': '#FF9F43'
            }
          }
        }
      },
      {
        name: "Royal Purple Theme",
        desc: "Sophisticated theme based on brand purple color",
        price: 200,
        stock: 999,
        metadata: {
          category: 'theme',
          themeConfig: {
            id: 'brand-purple',
            name: 'Royal Purple',
            variables: {
              '--background': '#F5F0FF',
              '--foreground': '#2F3640',
              '--card': '#FFFFFF',
              '--card-foreground': '#2F3640',
              '--popover': '#F5F0FF',
              '--popover-foreground': '#2F3640',
              '--primary': '#6C5CE7',
              '--primary-foreground': '#FFFFFF',
              '--secondary': '#D6C4E9',
              '--secondary-foreground': '#2F3640',
              '--muted': '#E8DAEF',
              '--muted-foreground': '#636E72',
              '--accent': '#9B59B6',
              '--accent-foreground': '#FFFFFF',
              '--destructive': '#E74C3C',
              '--border': '#D6C4E9',
              '--input': '#FFFFFF',
              '--ring': '#6C5CE7',
              '--chart-1': '#6C5CE7',
              '--chart-2': '#9B59B6',
              '--chart-3': '#A29BFE',
              '--chart-4': '#706FD3',
              '--chart-5': '#4834D4'
            }
          }
        }
      },
      {
        name: "Fresh Mint Theme",
        desc: "Refreshing theme based on brand mint color",
        price: 180,
        stock: 999,
        metadata: {
          category: 'theme',
          themeConfig: {
            id: 'brand-mint',
            name: 'Fresh Mint',
            variables: {
              '--background': '#F0FFF9',
              '--foreground': '#2F3640',
              '--card': '#FFFFFF',
              '--card-foreground': '#2F3640',
              '--popover': '#F0FFF9',
              '--popover-foreground': '#2F3640',
              '--primary': '#55E6C1',
              '--primary-foreground': '#2F3640',
              '--secondary': '#D5F5E3',
              '--secondary-foreground': '#2F3640',
              '--muted': '#D5F5E3',
              '--muted-foreground': '#2F3640',
              '--accent': '#27AE60',
              '--accent-foreground': '#FFFFFF',
              '--destructive': '#E74C3C',
              '--border': '#A9DFBF',
              '--input': '#FFFFFF',
              '--ring': '#55E6C1',
              '--chart-1': '#55E6C1',
              '--chart-2': '#27AE60',
              '--chart-3': '#2ECC71',
              '--chart-4': '#55EFC4',
              '--chart-5': '#1ABC9C'
            }
          }
        }
      },
      {
        name: "Slate Professional Theme",
        desc: "Professional theme based on brand slate color",
        price: 180,
        stock: 999,
        metadata: {
          category: 'theme',
          themeConfig: {
            id: 'brand-slate',
            name: 'Slate Professional',
            variables: {
              '--background': '#F8F9FA',
              '--foreground': '#2F3640',
              '--card': '#FFFFFF',
              '--card-foreground': '#2F3640',
              '--popover': '#F8F9FA',
              '--popover-foreground': '#2F3640',
              '--primary': '#2F3640',
              '--primary-foreground': '#FFFFFF',
              '--secondary': '#EDEDED',
              '--secondary-foreground': '#2F3640',
              '--muted': '#BDC3C7',
              '--muted-foreground': '#2F3640',
              '--accent': '#95A5A6',
              '--accent-foreground': '#FFFFFF',
              '--destructive': '#E74C3C',
              '--border': '#BDC3C7',
              '--input': '#FFFFFF',
              '--ring': '#2F3640',
              '--chart-1': '#2F3640',
              '--chart-2': '#535C68',
              '--chart-3': '#95A5A6',
              '--chart-4': '#BDC3C7',
              '--chart-5': '#7F8C8D'
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
          userId: getRandomItem(admins).id,
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
      { title: "Dueling Club", description: "Practice your defensive and offensive spells.", type: "Workshop", location: "Grand Hall" },
      { title: "Potions Workshop", description: "Advanced brewing techniques from industry experts.", type: "Academic", location: "Dungeons" },
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

    console.log("🏆 Seeding Leaderboards...");
    const categories = [LeaderboardCategory.allTime, LeaderboardCategory.weekly, LeaderboardCategory.monthly];
    let lbCount = 0;

    for (const student of students) {
      for (const cat of categories) {
        try {
          await prisma.leaderboard.create({
            data: {
              userId: student.id,
              score: getRandomInt(100, 10000),
              category: cat,
              periodStart: new Date(),
            }
          });
          lbCount++;
        } catch (e: any) { }
      }
    }
    console.log(`✅ ${lbCount} Leaderboard entries created.`);

    console.log("🎖️ Seeding Achievements...");
    const achievementData = [
      { name: "First Steps", description: "Joined the BBrains community.", tier: 1, rewardXP: 50, rewardCoins: 25, category: "Milestone" },
      { name: "Quick Learner", description: "Reached Level 5 efficiently.", tier: 5, rewardXP: 150, rewardCoins: 75, category: "Milestone" },
      { name: "Scholar", description: "Completed 10 unique assignments.", tier: 7, rewardXP: 250, rewardCoins: 100, category: "Academic" },
      { name: "Market Guru", description: "Traded 5+ items in the marketplace.", tier: 4, rewardXP: 120, rewardCoins: 150, category: "Market" },
      { name: "Legendary", description: "Reached Level 20.", tier: 20, rewardXP: 1000, rewardCoins: 500, category: "Milestone" },
    ];

    const achievements = [];
    for (const a of achievementData) {
      const ach = await prisma.achievement.create({ data: a });
      achievements.push(ach);
    }

    let achCount = 0;
    for (const student of students) {
      const count = getRandomInt(1, 4);
      const userAchs = getRandomItems(achievements, count);

      for (const ach of userAchs) {
        try {
          await prisma.userAchievements.create({
            data: { userId: student.id, achievementId: ach.id }
          });
          achCount++;
        } catch (e: any) { }
      }
    }
    console.log(`✅ ${achievements.length} Achievements, ${achCount} assigned.`);

    console.log("💳 Seeding Transactions...");
    for (let i = 0; i < 30; i++) {
      const user = getRandomItem([...students, ...teachers]);
      try {
        await prisma.transactionHistory.create({
          data: {
            userId: user.id,
            amount: getRandomInt(20, 1000),
            type: getRandomItem([TransactionType.credit, TransactionType.debit]),
            status: i % 10 === 0 ? TransactionStatus.pending : TransactionStatus.success,
            note: `Market Purchase / Reward #${i + 1}`,
          }
        });
      } catch (e: any) { }
    }
    console.log("✅ 30 Transactions created.");

    console.log("🕵️ Seeding Audit Logs...");
    const logActions = ["CREATE", "UPDATE", "DELETE", "AUTH_LOGIN", "AUTH_LOGOUT", "PURCHASE"];
    const logEntities = ["Product", "Grade", "User", "Order", "Cart", "Event"];

    for (let i = 0; i < 30; i++) {
      try {
        await prisma.auditLog.create({
          data: {
            user: { connect: { id: getRandomItem([...students, ...teachers, ...admins, ...superAdmins]).id } },
            category: getRandomItem([LogCategory.AUTH, LogCategory.ACADEMIC, LogCategory.MARKET, LogCategory.FINANCE]),
            action: getRandomItem(logActions),
            entity: getRandomItem(logEntities),
            entityId: `id-${i}-${Math.random().toString(36).substring(7)}`,
            change: { old: { status: "inactive" }, new: { status: "active" } },
            reason: "System seeding process",
          }
        });
      } catch (e: any) { }
    }
    console.log("✅ 30 Audit logs created.");

    console.log("\n" + "=".repeat(70));
    console.log("✅ ✅ ✅ BBRAINS SEEDING COMPLETED SUCCESSFULLY! ✅ ✅ ✅");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  • ${colleges.length} Colleges`);
    console.log(`  • ${superAdmins.length} Super Admins`);
    console.log(`  • ${admins.length} Admins (Supabase UID)`);
    console.log(`  • ${teachers.length} Teachers`);
    console.log(`  • ${students.length} Students (+ Attendance & Streaks)`);
    console.log(`  • ${courses.length} Courses`);
    console.log(`  • ${assignments.length} Assignments`);
    console.log(`  • ${products.length} Products + ${themes.length} Themes`);
    console.log(`  • ${eventData.length} Events`);
    console.log(`  • ${orderCount} Orders`);
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