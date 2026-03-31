import { prisma } from './prisma.js';

let cachedGlobalFeatures = null;
let lastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getGlobalFeatures = async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedGlobalFeatures && (now - lastFetched) < CACHE_TTL) {
        return cachedGlobalFeatures;
    }

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: 'global_features' }
        });

        cachedGlobalFeatures = config ? JSON.parse(config.value) : {};
        lastFetched = now;
        return cachedGlobalFeatures;
    } catch (error) {
        console.error('Error fetching global features:', error);
        return cachedGlobalFeatures || {}; // fallback to old cache or empty
    }
};

export const clearFeaturesCache = () => {
    cachedGlobalFeatures = null;
    lastFetched = 0;
};
