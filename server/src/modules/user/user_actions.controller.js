import { updateUser, deleteUser, claimDailyRewards } from "./user_actions.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Only allow self-edit or admin
        if (req.user.id !== id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized to update this user', 403);
        }

        const data = req.body;
        const result = await updateUser(id, data);

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: data });
        return sendSuccess(res, result, 'User updated successfully');
    } catch (error) {
        console.error("User Action Error:", error);
        return sendError(res, "Failed to update user", 500);
    }
}

const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteUser(id);

        await createAuditLog(req.user.id, 'USER', 'DELETE', 'User', id);
        return sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
        console.error("User Action Error:", error);
        return sendError(res, "Failed to delete user", 500);
    }
}

const dailyClaim = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await claimDailyRewards(userId);
        return sendSuccess(res, result, 'Daily rewards claimed successfully');
    } catch (error) {
        console.error("User Action Error:", error);
        return sendError(res, error.message, 400);
    }
}

export { editUser, removeUser, dailyClaim };
