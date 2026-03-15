import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Optional: Explicitly connect and log status
prisma.$connect()
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });

export default prisma;
