import prisma from '../../utils/prisma.js';

export const getAllConfigs = async () => {
    return await prisma.systemConfig.findMany({
        orderBy: { key: 'asc' }
    });
};

export const setConfig = async (key, value, type = 'string', description = null) => {
    return await prisma.systemConfig.upsert({
        where: { key },
        update: { value: String(value), type, description },
        create: { key, value: String(value), type, description }
    });
};

export const deleteConfig = async (key) => {
    return await prisma.systemConfig.delete({
        where: { key }
    });
};

export const getConfigValue = async (key, defaultValue = null) => {
    const config = await prisma.systemConfig.findUnique({
        where: { key }
    });

    if (!config) return defaultValue;

    switch (config.type) {
        case 'number': return Number(config.value);
        case 'boolean': return config.value === 'true';
        case 'json': 
            try { return JSON.parse(config.value); } 
            catch { return config.value; }
        default: return config.value;
    }
};
