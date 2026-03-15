import { getAllConfigs, setConfig, deleteConfig, getConfigValue } from './config.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

export const getConfigs = async (req, res) => {
    try {
        const configs = await getAllConfigs();
        return sendSuccess(res, configs);
    } catch (error) {
        return sendError(res, 'Failed to fetch configurations', 500);
    }
};

export const updateConfig = async (req, res) => {
    try {
        const { key, value, type, description } = req.body;
        if (!key || value === undefined) {
            return sendError(res, 'Key and value are required', 400);
        }

        const config = await setConfig(key, value, type, description);
        
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'SystemConfig', key, { value, type });
        
        return sendSuccess(res, config, 'Configuration updated');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to update configuration', 500);
    }
};

export const removeConfig = async (req, res) => {
    try {
        const { key } = req.params;
        await deleteConfig(key);
        
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'SystemConfig', key);
        
        return sendSuccess(res, null, 'Configuration deleted');
    } catch (error) {
        return sendError(res, 'Failed to delete configuration', 500);
    }
};

export const getPublicConfigs = async (req, res) => {
    try {
        // Expose only non-sensitive keys
        const maintenanceMode = await getConfigValue('MAINTENANCE_MODE', false);
        const welcomeMessage = await getConfigValue('WELCOME_MESSAGE', 'Welcome to BBrains!');
        const allowSignups = await getConfigValue('ALLOW_SIGNUPS', true);
        
        return sendSuccess(res, {
            maintenanceMode,
            welcomeMessage,
            allowSignups
        });
    } catch (error) {
        return sendError(res, 'Failed to fetch public configurations', 500);
    }
};
