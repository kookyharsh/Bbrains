import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

// Route imports
import authRouter from "./modules/auth/auth.routes.js";
import marketRouter from "./modules/market/market.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import userRouter from "./modules/user/user.routes.js";
import academicRouter from "./modules/academic/academic.routes.js";
import walletRouter from "./modules/wallet/wallet.routes.js";
import logRouter from "./modules/log/log.routes.js";
import collegeRouter from "./modules/college/college.routes.js";
import addressRouter from "./modules/user/address.routes.js";
import courseRouter from "./modules/course/course.routes.js";
import enrollmentRouter from "./modules/enrollment/enrollment.routes.js";
import gradeRouter from "./modules/grade/grade.routes.js";
import roleRouter from "./modules/academic/role.routes.js";
import xpRouter from "./modules/xp/xp.routes.js";
import leaderboardRouter from "./modules/leaderboard/leaderboard.routes.js";
import achievementRouter from "./modules/achievement/achievement.routes.js";
import transactionRouter from "./modules/transaction/transaction.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import eventRouter from "./modules/event/event.routes.js";
import attendanceRouter from "./modules/attendance/attendance.routes.js";
import streakRouter from "./modules/streak/streak.routes.js";
import announcementRouter from "./modules/announcement/announcement.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";

// Middleware imports
import errorHandler from "./middleware/errorHandler.js";
// import { connectMongo, hasMongoConnection } from "./utils/mongo.js"; // MongoDB removed
import { initChatSocket } from "./modules/chat/chat.socket.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: true, // Reflects the request origin, allowing any origin for local testing
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/market", marketRouter);
app.use("/dashboard", dashboardRouter);
app.use("/academic", academicRouter);
app.use("/wallet", walletRouter);
app.use("/logs", logRouter);
app.use("/colleges", collegeRouter);
app.use("/addresses", addressRouter);
app.use("/courses", courseRouter);
app.use("/enrollments", enrollmentRouter);
app.use("/grades", gradeRouter);
app.use("/roles", roleRouter);
app.use("/xp", xpRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/achievements", achievementRouter);
app.use("/transactions", transactionRouter);
app.use("/orders", orderRouter);
app.use("/events", eventRouter);
app.use("/attendance", attendanceRouter);
app.use("/streak", streakRouter);
app.use("/announcements", announcementRouter);
app.use("/chat", chatRouter);


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initChatSocket(server);

// void connectMongo(); // MongoDB removed

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
