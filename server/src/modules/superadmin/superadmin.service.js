import { prisma } from '../../utils/prisma.js';
import { clearFeaturesCache } from '../../utils/featureFlags.js';

export const getAllColleges = async () => {
    return await prisma.college.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

export const getCollegeFeatures = async (collegeId) => {
    const college = await prisma.college.findUnique({
        where: { id: parseInt(collegeId) },
        select: { features: true }
    });
    return college ? (college.features || {}) : null;
};

export const updateCollegeFeatures = async (collegeId, features) => {
    return await prisma.college.update({
        where: { id: parseInt(collegeId) },
        data: { features }
    });
};

export const getGlobalFeatures = async () => {
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'global_features' }
    });
    return config ? JSON.parse(config.value) : {};
};

export const updateGlobalFeatures = async (features) => {
    const config = await prisma.systemConfig.upsert({
        where: { key: "global_features" },
        update: { value: JSON.stringify(features) },
        create: {
            key: "global_features",
            value: JSON.stringify(features),
            type: "json",
            description: "Global feature flags"
        }
    });
    clearFeaturesCache();
    return config;
};
