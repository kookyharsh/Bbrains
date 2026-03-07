import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
    {
        messageId: { type: String, required: true },
        username: { type: String, required: true },
        content: { type: String, required: true }
    },
    { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        username: { type: String, required: true, index: true },
        displayName: { type: String, required: true },
        avatar: { type: String, default: "" },
        role: { type: String, required: true, enum: ["student", "teacher", "admin", "staff"] },
        content: { type: String, required: true, maxlength: 4000 },
        mentions: { type: [String], default: [] },
        replyTo: { type: replySchema, default: null },
        editedAt: { type: Date, default: null }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ createdAt: 1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;

