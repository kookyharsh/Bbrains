import prisma from "../utils/prisma.js";
import { PrismaPg } from "@prisma/adapter-pg";

async function seedColleges() {
  await prisma.college.deleteMany();
  const colleges = [
    { name: 'MIT', address: 'Cambridge, MA', email: 'admin@mit.edu', regNo: 'MIT001' },
    { name: 'Stanford', address: 'Palo Alto, CA', email: 'admin@stanford.edu', regNo: 'STAN001' },
    { name: 'Tilak Maharashtra Vidyapeth', address: 'Pune, India', email: 'admin@tmv.ac.in', regNo: 'TMVB001' }
  ];
  await prisma.college.createMany({ data: colleges });
  console.log('✅ Seeded 3 colleges');
}
async function seedRoles() {
  await prisma.role.deleteMany();
  const roles = [
    { name: 'Super Admin', description: 'Full platform access' },
    { name: 'College Admin', description: 'College management' },
    { name: 'Teacher', description: 'Course instructor' },
    { name: 'Student', description: 'Learner' }
  ];
  await prisma.role.createMany({ data: roles });
  console.log('✅ Seeded 4 roles');
}
async function seedCourses() {
  // First get a college
  const college = await prisma.college.findFirst();

  await prisma.course.deleteMany();
  const courses = [
    { name: 'Web Development', description: 'Full-stack development' },
    { name: 'Data Structures', description: 'Advanced algorithms' },
    { name: 'Database Systems', description: 'SQL and NoSQL' }
  ];
  await prisma.course.createMany({ data: courses });
  console.log('✅ Seeded 3 courses');
}

async function main() {
  console.log('🌱 Seeding levels...');

  // Generate 100 levels with exponential XP growth
  // Level 1: 0 XP, Level 2: 100, Level 3: 220, Level 4: 360...
  const levels = [];

  for (let i = 1; i <= 100; i++) {
    // Formula: 100 * i * log(i + 1) for smooth exponential curve
    const requiredXp = Math.floor(100 * i * Math.log(i + 1) * 1.2);
    levels.push({
      levelNumber: i,
      requiredXp: requiredXp.toString() // Prisma Decimal as string
    });
    console.log(`- Level ${i}: ${requiredXp} XP`);
  }

  // Clear existing levels
  await prisma.level.deleteMany();
  console.log('🗑️  Cleared existing levels');

  // Bulk insert all levels
  await prisma.level.createMany({
    data: levels
  });

  console.log(`✅ Seeded ${levels.length} levels!`);

  console.log('🧹 Cleaning up existing data...');
  try {
    await prisma.product.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.userDetails.deleteMany();
    await prisma.xp.deleteMany(); // Assuming this exists based on creation
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Warning during cleanup:');
  }

  await seedColleges();
  await seedRoles();
  await seedCourses();
  await seedUsersAndData();
}

async function seedUsersAndData() {
  console.log('🌱 Seeding Users, Products, and Wallets...');

  const college = await prisma.college.findFirst();
  if (!college) throw new Error("No college found - seeding failed");

  const course = await prisma.course.findFirst();
  if (!course) throw new Error("No course found - seeding failed");

  // Create Teacher
  const teacher = await prisma.user.create({
    data: {
      username: 'Sensei_John',
      email: 'john@teacher.com',
      password: '$2b$10$EpIxNwllb6qH.bH.bH.bHe', // dummy hash
      collegeId: college.id,
      type: 'teacher',
      userDetails: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          sex: 'male',
          dob: new Date('1980-01-01'),
          phone: '1234567890'
        }
      }
    }
  });

  // Create Student
  const student = await prisma.user.create({
    data: {
      username: 'Student_Jane',
      email: 'jane@student.com',
      password: '$2b$10$EpIxNwllb6qH.bH.bH.bHe',
      collegeId: college.id,
      type: 'student',
      userDetails: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          sex: 'female',
          dob: new Date('2000-01-01'),
          phone: '0987654321'
        }
      }
    }
  });

  // Handle Wallet (upsert to avoid constraints if auto-created)
  await prisma.wallet.upsert({
    where: { userId: student.id },
    create: {
      userId: student.id,
      balance: 1000.00,
      pin: '1234'
    },
    update: {
      balance: 1000.00,
      pin: '1234'
    }
  });

  // Create Assignment
  await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: 'React Basics',
      description: 'Build a Counter App',
      content: 'Use useState hook.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Create Products
  await prisma.product.createMany({
    data: [
      {
        creatorId: teacher.id,
        name: 'Python E-Book',
        description: 'Learn Python Fast',
        price: 99.99,
        stock: 100,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: teacher.id,
        name: 'JavaScript E-Book',
        description: 'Learn JavaScript Fast',
        price: 99.99,
        stock: 100,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: teacher.id,
        name: 'Cool Sticker',
        description: 'Laptop Sticker',
        price: 5.00,
        stock: 50,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Physics 101 Notes',
        description: 'Comprehensive handwritten notes for Physics 101',
        price: 14.99,
        stock: 50,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Abstract Digital Art',
        description: 'High-res abstract digital art print',
        price: 25.00,
        stock: 10,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Organic Chemistry Diagrams',
        description: 'Detailed reaction mechanisms and notes',
        price: 19.99,
        stock: 30,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Charcoal Sketch: Campus',
        description: 'Hand-drawn charcoal sketch of the main building',
        price: 45.00,
        stock: 1,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Calculus Cheat Sheet',
        description: ' essential formulas for derivatives and integrals',
        price: 9.99,
        stock: 100,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Digital Portrait Commission',
        description: 'Custom digital style portrait from your photo',
        price: 50.00,
        stock: 5,
        image: 'https://via.placeholder.com/150'
      },
      {
        creatorId: student.id,
        name: 'Voxel Art Asset Pack',
        description: 'Low-poly 3D assets for game dev',
        price: 29.99,
        stock: 20,
        image: 'https://via.placeholder.com/150'
      }
    ]
  });

  console.log('✅ Seeded Users, Wallet, Assignments & Products');
}
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });