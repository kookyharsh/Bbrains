import { sendSuccess, sendError } from '../../utils/response.js';
import * as superadminService from './superadmin.service.js';
import { createAuditLog } from '../../utils/auditLog.js';

export const listColleges = async (req, res, next) => {
    try {
        const colleges = await superadminService.getAllColleges();
        return sendSuccess(res, colleges, 'Colleges fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const getCollegeFeatures = async (req, res, next) => {
    try {
        const features = await superadminService.getCollegeFeatures(req.params.id);
        if (!features) return sendError(res, 'College not found', 404);
        return sendSuccess(res, features, 'Features fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const updateCollegeFeatures = async (req, res, next) => {
    try {
        const { features } = req.body;
        const college = await superadminService.updateCollegeFeatures(req.params.id, features);
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'CollegeFeatures', req.params.id, features);
        return sendSuccess(res, college.features, 'College features updated successfully');
    } catch (error) {
        next(error);
    }
};

export const getGlobalFeatures = async (req, res, next) => {
    try {
        const features = await superadminService.getGlobalFeatures();
        return sendSuccess(res, features, 'Global features fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const updateGlobalFeatures = async (req, res, next) => {
    try {
        const { features } = req.body;
        const config = await superadminService.updateGlobalFeatures(features);
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'GlobalFeatures', 'global_features', features);
        return sendSuccess(res, JSON.parse(config.value), 'Global features updated successfully');
    } catch (error) {
        next(error);
    }
};
