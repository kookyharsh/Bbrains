import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const poolMax = Number(process.env.PG_POOL_MAX || 10);

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const globalForPrisma = globalThis;

const pool = globalForPrisma.__bbPgPool ?? new Pool({
    connectionString,
    max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 10,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true,
});

const adapter = globalForPrisma.__bbPrismaAdapter ?? new PrismaPg(pool);
const prisma = globalForPrisma.__bbPrismaClient ?? new PrismaClient({ adapter });

if (!globalForPrisma.__bbPgPool) {
    globalForPrisma.__bbPgPool = pool;
}

if (!globalForPrisma.__bbPrismaAdapter) {
    globalForPrisma.__bbPrismaAdapter = adapter;
}

if (!globalForPrisma.__bbPrismaClient) {
    globalForPrisma.__bbPrismaClient = prisma;
}

export { prisma };
export default prisma;
