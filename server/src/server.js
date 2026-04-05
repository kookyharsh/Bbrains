import express from "express";
import superadminRoutes from "./modules/superadmin/superadmin.routes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

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
import notificationRouter from "./modules/notification/notification.routes.js";
import configRouter from "./modules/config/config.routes.js";
import suggestionRouter from "./modules/suggestion/suggestion.routes.js";
import assessmentRouter from "./modules/assessment/assessment.routes.js";
import prisma from "./utils/prisma.js";

// Middleware imports
import errorHandler from "./middleware/errorHandler.js";
// import { connectMongo, hasMongoConnection } from "./utils/mongo.js"; // MongoDB removed
import { initChatSocket } from "./modules/chat/chat.socket.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

// CORS configuration: whitelist specific origins for security
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://100.74.244.98:3000",
  "http://100.74.244.98:5000",
];
app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser requests like Postman/no-origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

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
app.use("/notifications", notificationRouter);
app.use("/config", configRouter);
app.use("/suggestions", suggestionRouter);
app.use("/superadmin", superadminRoutes);
app.use("/assessments", assessmentRouter);


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

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Closing server and database connections...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error while disconnecting Prisma:", error);
    } finally {
      process.exit(0);
    }
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

export default app;
