import supabase from "../utils/supabase.js";

const CHAT_MESSAGES_TABLE = "chat_messages";

/**
 * Insert a new chat message into Supabase
 * @param {Object} messageData - The message data to insert
 * @param {string} messageData.chat_id - The chat ID
 * @param {string} messageData.user_id - The user ID
 * @param {string} messageData.username - The username
 * @param {string} messageData.displayName - The display name
 * @param {string} messageData.avatar - The avatar URL
 * @param {string} messageData.role - The user role
 * @param {string} messageData.content - The message content
 * @param {Array} messageData.mentions - Array of mentioned usernames
 * @param {string} [messageData.replyTo] - Optional ID of message being replied to
 * @returns {Promise<Object>} The inserted message
 */
export const insertChatMessage = async (messageData) => {
    try {
        const { data, error } = await supabase
            .from(CHAT_MESSAGES_TABLE)
            .insert({
                chat_id: messageData.chat_id || 'default',
                user_id: messageData.user_id,
                username: messageData.username,
                display_name: messageData.displayName,
                avatar: messageData.avatar,
                role: messageData.role,
                content: messageData.content,
                mentions: messageData.mentions || [],
                reply_to: messageData.replyTo || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("Error inserting chat message:", error);
            return null;
        }

        return formatMessage(data);
    } catch (error) {
        console.error("Exception inserting chat message:", error);
        return null;
    }
};

/**
 * Get a chat message by ID
 * @param {string} messageId - The message ID
 * @returns {Promise<Object|null>} The message or null if not found
 */
export const getMessageById = async (messageId) => {
    try {
        const { data, error } = await supabase
            .from(CHAT_MESSAGES_TABLE)
            .select("*")
            .eq("id", messageId)
            .single();

        if (error) {
            console.error("Error getting message by ID:", error);
            return null;
        }

        return formatMessage(data);
    } catch (error) {
        console.error("Exception getting message by ID:", error);
        return null;
    }
};

/**
 * Update a chat message
 * @param {string} messageId - The message ID to update
 * @param {Object} updateData - The data to update
 * @param {string} updateData.content - The new content
 * @param {Array} updateData.mentions - The new mentions array
 * @returns {Promise<Object|null>} The updated message or null if failed
 */
export const updateChatMessage = async (messageId, updateData) => {
    try {
        const { data, error } = await supabase
            .from(CHAT_MESSAGES_TABLE)
            .update({
                content: updateData.content,
                mentions: updateData.mentions || [],
                updated_at: new Date().toISOString()
            })
            .eq("id", messageId)
            .select()
            .single();

        if (error) {
            console.error("Error updating chat message:", error);
            return null;
        }

        return formatMessage(data);
    } catch (error) {
        console.error("Exception updating chat message:", error);
        return null;
    }
};

/**
 * Delete a chat message
 * @param {string} messageId - The message ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteChatMessage = async (messageId) => {
    try {
        const { error } = await supabase
            .from(CHAT_MESSAGES_TABLE)
            .delete()
            .eq("id", messageId);

        if (error) {
            console.error("Error deleting chat message:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Exception deleting chat message:", error);
        return false;
    }
};

/**
 * Get messages for a specific chat
 * @param {string} [chatId] - Optional chat ID to filter by
 * @param {number} [limit=200] - Maximum number of messages to return
 * @returns {Promise<Array>} Array of messages
 */
export const getMessagesForChat = async (chatId, limit = 200) => {
    try {
        let query = supabase
            .from(CHAT_MESSAGES_TABLE)
            .select("*")
            .order("created_at", { ascending: true })
            .limit(limit);

        if (chatId) {
            query = query.eq("chat_id", chatId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error getting chat messages:", error);
            return [];
        }

        return (data || []).map(formatMessage);
    } catch (error) {
        console.error("Exception getting chat messages:", error);
        return [];
    }
};

/**
 * Format a raw Supabase message into the expected format
 * @param {Object} message - Raw message from Supabase
 * @returns {Object} Formatted message
 */
const formatMessage = (message) => {
    if (!message) return null;
    
    return {
        id: message.id,
        chatId: message.chat_id,
        userId: message.user_id,
        username: message.username,
        displayName: message.display_name,
        avatar: message.avatar,
        role: message.role,
        content: message.content,
        mentions: message.mentions || [],
        replyToMessageId: message.reply_to,
        createdAt: message.created_at,
        updatedAt: message.updated_at
    };
};

export default {
    insertChatMessage,
    getMessageById,
    updateChatMessage,
    deleteChatMessage,
    getMessagesForChat
};

