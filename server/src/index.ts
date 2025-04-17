import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { setupCanBus } from "./can/can-service.js";
import { setupSystemMonitoring } from "./system/system-monitor.js";
import { logger } from "./utils/logger.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api/system", (await import("./routes/system-routes.js")).default);
app.use("/api/can", (await import("./routes/can-routes.js")).default);

// WebSocket setup
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Initialize services
setupCanBus(io);
setupSystemMonitoring(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// For Vite development
export const viteNodeApp = app;
