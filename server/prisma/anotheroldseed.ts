// import { PrismaClient } from '@prisma/client';
import { UserRole, Sex, TransactionType, TransactionStatus, LeaderboardCategory, LogCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';

// const prisma = new PrismaClient();

// Helper Utilities
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

async function main() {
  console.log("🌱 Starting Seeding Process...");

  try {
    // 1. CLEANUP
    console.log("🧹 Cleaning database...");
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
    console.log("✅ Database cleaned.");

    // 2. SEED ADDRESSES FOR COLLEGES
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

    // 3. SEED LEVELS
    console.log("🎮 Seeding 40 Levels...");
    const levelsData = Array.from({ length: 40 }, (_, i) => ({
      levelNumber: i + 1,
      requiredXp: String((i + 1) * 500),
    }));
    await prisma.level.createMany({ data: levelsData });
    console.log("✅ 40 Levels created.");

    // 4. SEED COLLEGES
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

    // 5. SEED ROLES
    console.log("👥 Seeding Roles...");
    const roles = await Promise.all([
      prisma.role.create({ data: { name: 'Student', description: 'Student role' } }),
      prisma.role.create({ data: { name: 'Teacher', description: 'Instructor role' } }),
      prisma.role.create({ data: { name: 'Admin', description: 'System Administrator' } }),
    ]);
    console.log("✅ 3 Roles created.");

    // 6. SEED USERS - Step by step with separate wallet/xp creation
    console.log("👥 Seeding Users...");
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admins: any[] = [];
    const teachers: any[] = [];
    const students: any[] = [];

    // Helper function to create user with details
    async function createUserComplete(userData: any, detailsData: any, userType: 'admin' | 'teacher' | 'student') {
      // Step 1: Create user (only required fields)
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          type: userData.type,
          collegeId: userData.collegeId,
        }
      });

      // Step 2: Create user details
      const details = await prisma.userDetails.create({
        data: {
          userId: user.id,
          firstName: detailsData.firstName,
          lastName: detailsData.lastName,
          sex: detailsData.sex,
          dob: detailsData.dob,
          phone: detailsData.phone,
          addressId: detailsData.addressId || null,
        }
      });

      // Step 3: Create wallet (trigger might create this, but let's ensure)
      try {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: userType === 'admin' ? 10000 : userType === 'teacher' ? 5000 : getRandomInt(500, 3000)
          }
        });
      } catch (e) {
        // Wallet might be created by trigger, skip if exists
      }

      // Step 4: Create XP
      await prisma.xp.create({
        data: {
          userId: user.id,
          xp: userType === 'student' ? getRandomInt(100, 5000) : getRandomInt(500, 2000),
          level: userType === 'student' ? getRandomInt(1, 10) : getRandomInt(1, 6)
        }
      });

      return user;
    }

    // Create 2 Admins
    console.log("  Creating 2 admins...");
    for (let i = 1; i <= 2; i++) {
      const admin = await createUserComplete(
        {
          email: `admin${i}@learnytics.com`,
          username: `admin_${i}`,
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
      
      // Assign admin role
      await prisma.userRoles.create({
        data: { userId: admin.id, roleId: roles[2].id }
      });
      
      console.log(`    ✅ Admin ${i} created`);
    }

    // Create 5 Teachers
    console.log("  Creating 5 teachers...");
    const teacherNames = ["Snape", "McGonagall", "Flitwick", "Sprout", "Lupin"];
    for (let i = 0; i < 5; i++) {
      const teacher = await createUserComplete(
        {
          email: `teacher${i + 1}@learnytics.com`,
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
        data: { userId: teacher.id, roleId: roles[1].id }
      });
      
      console.log(`    ✅ Teacher ${i + 1} created`);
    }

    // Create 7 Students with addresses
    console.log("  Creating 7 students...");
    const studentNames = ["Harry", "Ron", "Hermione", "Draco", "Luna", "Neville", "Ginny"];
    for (let i = 0; i < 7; i++) {
      // Create address for student
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
          email: `student${i + 1}@learnytics.com`,
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
        data: { userId: student.id, roleId: roles[0].id }
      });
      
      console.log(`    ✅ Student ${i + 1} created`);
    }

    console.log(`✅ All users created: ${admins.length} admins, ${teachers.length} teachers, ${students.length} students`);

    // 7. SEED COURSES
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

      // Enroll random students
      const enrollCount = getRandomInt(3, Math.min(5, students.length));
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
        } catch (e) { /* Skip duplicates */ }
      }
    }
    console.log(`✅ ${courses.length} Courses created.`);

    // 8. SEED ASSIGNMENTS
    console.log("📝 Seeding Assignments...");
    const assignments = [];
    for (let i = 0; i < 10; i++) {
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

    // 9. SEED SUBMISSIONS & GRADES
    console.log("✏️ Seeding Submissions & Grades...");
    let submissionCount = 0;
    for (const assign of assignments) {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: assign.courseId },
        include: { user: true }
      });

      const submitters = getRandomItems(
        enrollments.map(e => e.user),
        Math.max(1, Math.ceil(enrollments.length / 2))
      );

      for (const student of submitters) {
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
        } catch (e) { /* Skip duplicates */ }
      }
    }
    console.log(`✅ ${submissionCount} Submissions & Grades created.`);

    // 10. SEED PRODUCTS
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
          image: `https://placehold.co/400?text=${encodeURIComponent(p.name)}`
        }
      });
      products.push(prod);
    }
    console.log(`✅ ${products.length} Products created.`);

    // 11. SEED CARTS
    console.log("🛒 Adding to carts...");
    let cartCount = 0;
    for (const student of students) {
      const itemCount = getRandomInt(1, 3);
      const items = getRandomItems(products, itemCount);
      
      for (const prod of items) {
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
        } catch (e) { /* Skip duplicates */ }
      }
    }
    console.log(`✅ ${cartCount} Cart items created.`);

    // 12. SEED ANNOUNCEMENTS
    console.log("📢 Seeding Announcements...");
    const announcements = [
      { title: "Welcome!", desc: "Start earning XP today!" },
      { title: "Exams Approaching", desc: "Study hard!" },
      { title: "New Products", desc: "Check the marketplace!" },
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

    // 13. SEED LEADERBOARDS
    console.log("🏆 Seeding Leaderboards...");
    const categories = [LeaderboardCategory.allTime, LeaderboardCategory.weekly, LeaderboardCategory.monthly];
    let lbCount = 0;
    
    for (const student of students) {
      for (const cat of categories) {
        try {
          await prisma.leaderboard.create({
            data: {
              userId: student.id,
              score: getRandomInt(100, 5000),
              category: cat,
              periodStart: new Date(),
            }
          });
          lbCount++;
        } catch (e) { /* Skip duplicates */ }
      }
    }
    console.log(`✅ ${lbCount} Leaderboard entries created.`);

    // 14. SEED ACHIEVEMENTS
    console.log("🎖️ Seeding Achievements...");
    const achievements = await Promise.all([
      prisma.achievement.create({ data: { name: "First Steps", description: "Created account", requiredXp: 0, category: "Milestone" }}),
      prisma.achievement.create({ data: { name: "Quick Learner", description: "Reached Level 5", requiredXp: 2500, category: "Milestone" }}),
      prisma.achievement.create({ data: { name: "Scholar", description: "10 assignments", requiredXp: 5000, category: "Academic" }}),
      prisma.achievement.create({ data: { name: "Trader", description: "First purchase", requiredXp: 1000, category: "Market" }}),
      prisma.achievement.create({ data: { name: "Expert", description: "Level 20", requiredXp: 10000, category: "Milestone" }}),
    ]);

    let achCount = 0;
    for (const student of students) {
      const count = getRandomInt(1, 3);
      const userAchs = getRandomItems(achievements, count);
      
      for (const ach of userAchs) {
        try {
          await prisma.userAchievements.create({
            data: { userId: student.id, achievementId: ach.id }
          });
          achCount++;
        } catch (e) { /* Skip duplicates */ }
      }
    }
    console.log(`✅ ${achievements.length} Achievements, ${achCount} assigned.`);

    // 15. SEED TRANSACTIONS
    console.log("💳 Seeding Transactions...");
    for (let i = 0; i < 20; i++) {
      const user = getRandomItem([...students, ...teachers]);
      try {
        await prisma.transactionHistory.create({
          data: {
            userId: user.id,
            amount: getRandomInt(50, 500),
            type: getRandomItem([TransactionType.credit, TransactionType.debit]),
            status: i % 5 === 0 ? TransactionStatus.pending : TransactionStatus.success,
            note: `Transaction #${i + 1}`,
          }
        });
      } catch (e) { /* Skip errors */ }
    }
    console.log("✅ 20 Transactions created.");

    // 16. SEED AUDIT LOGS
    console.log("🕵️ Seeding Audit Logs...");
    const actions = ["CREATE", "UPDATE", "DELETE", "LOGIN"];
    const entities = ["Product", "Grade", "User", "Order"];
    
    for (let i = 0; i < 20; i++) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: getRandomItem([...students, ...teachers, ...admins]).id,
            category: getRandomItem([LogCategory.AUTH, LogCategory.ACADEMIC, LogCategory.MARKET]),
            action: getRandomItem(actions),
            entity: getRandomItem(entities),
            entityId: `entity-${i}`,
            change: { old: { val: i }, new: { val: i + 1 } },
            reason: "Seed data",
          }
        });
      } catch (e) { /* Skip errors */ }
    }
    console.log("✅ 20 Audit logs created.");

    // SUMMARY
    console.log("\n" + "=".repeat(70));
    console.log("✅ ✅ ✅ SEEDING COMPLETED SUCCESSFULLY! ✅ ✅ ✅");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  • ${colleges.length} Colleges`);
    console.log(`  • ${admins.length} Admins`);
    console.log(`  • ${teachers.length} Teachers`);
    console.log(`  • ${students.length} Students`);
    console.log(`  • ${courses.length} Courses`);
    console.log(`  • ${assignments.length} Assignments`);
    console.log(`  • ${products.length} Products`);
    console.log("\n🔐 Login (password: 'password123'):");
    console.log("  Admin:   admin1@learnytics.com");
    console.log("  Teacher: teacher1@learnytics.com");
    console.log("  Student: student1@learnytics.com");
    console.log("=".repeat(70) + "\n");

  } catch (error) {
    console.error("\n❌ SEEDING FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });