import mongoose from "mongoose";

let isConnected = false;

export const connectMongo = async () => {
    if (isConnected) return;

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.warn("MONGODB_URI is not set. Chat persistence is disabled.");
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        isConnected = true;
        console.log("MongoDB connected for chat storage");
    } catch (error) {
        isConnected = false;
        console.error("Failed to connect MongoDB:", error.message);
    }
};

export const hasMongoConnection = () => isConnected;

