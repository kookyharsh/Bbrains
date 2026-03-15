import prisma from './prisma.js';

/**
 * Create an audit log entry.
 * @param {string} userId - User performing the action
 * @param {string} category - AUTH, ACADEMIC, MARKET, FINANCE, USER, SYSTEM
 * @param {string} action - e.g. 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
 * @param {string} entity - e.g. 'User', 'Product', 'Order'
 * @param {string} entityId - ID of the affected entity
 * @param {object|null} change - Before/after state JSON
 * @param {string|null} reason - Optional reason for the action
 * @param {object|null} tx - Optional Prisma transaction client
 */
export const createAuditLog = async (userId, category, action, entity, entityId, change = null, reason = null, tx = null) => {
    const client = tx || prisma;

    try {
        return await client.auditLog.create({
            data: {
                userId,
                category,
                action,
                entity,
                entityId: String(entityId),
                change,
                reason
            }
        });
    } catch (error) {
        // Audit logging should never break the main operation
        console.error('Audit log error:', error.message);
    }
};
