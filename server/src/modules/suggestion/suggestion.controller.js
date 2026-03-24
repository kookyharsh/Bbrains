import { 
    createSuggestionRecord, 
    getSuggestionsByFilters, 
    updateSuggestionStatus, 
    deleteSuggestion 
} from './suggestion.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const createSuggestion = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return sendError(res, 'Title and content are required', 400);
        }

        const suggestion = await createSuggestionRecord(userId, title, content);
        return sendSuccess(res, suggestion, 'Suggestion submitted successfully', 201);
    } catch (error) {
        return sendError(res, 'Failed to submit suggestion', 500);
    }
};

export const getSuggestions = async (req, res) => {
    try {
        const filters = {};
        if (req.user.type !== 'admin') {
            filters.userId = req.user.id;
        } else if (req.query.userId) {
            filters.userId = req.query.userId;
        }

        if (req.query.status) {
            filters.status = req.query.status;
        }

        const suggestions = await getSuggestionsByFilters(filters);
        return sendSuccess(res, suggestions);
    } catch (error) {
        return sendError(res, 'Failed to fetch suggestions', 500);
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const suggestion = await updateSuggestionStatus(id, status);
        return sendSuccess(res, suggestion, 'Suggestion status updated');
    } catch (error) {
        return sendError(res, 'Failed to update suggestion status', 500);
    }
};

export const removeSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.type === 'admin' ? null : req.user.id;
        
        await deleteSuggestion(id, userId);
        return sendSuccess(res, null, 'Suggestion deleted');
    } catch (error) {
        return sendError(res, 'Failed to delete suggestion', 500);
    }
};
