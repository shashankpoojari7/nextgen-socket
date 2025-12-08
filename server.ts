import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import { Server } from "socket.io";
import dbConnect from "./src/database/dbConnection";
import User from "./src/models/user.model";
import Post from "./src/models/post.model";

async function startSocketServer() {
  await dbConnect();

  const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Socket server is running 🚀");
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
    path: "/socket.io", 
    transports: ["polling", "websocket"],
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) return socket.disconnect();

    // Track user sessions
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Notify others
    io.emit("presence:online", { userId });
    socket.emit("presence:list", { online: [...onlineUsers.keys()] });

    socket.join(`user:${userId}`);

    // Chat message
    socket.on("chat:send", (data) => {
      io.to(`user:${data.to}`).emit("chat:message", data);
    });

    // Notification
    socket.on("notification", async (payload) => {
      try {
        const sender = await User.findById(payload.from)
          .select("username profile_image");

        let postPreview = null;
        if (payload.type === "LIKE" || payload.type === "COMMENT") {
          const post = await Post.findById(payload.entityId).select("imageUrl");
          postPreview = post?.imageUrl ?? null;
        }

        io.to(`user:${payload.to}`).emit("notification", {
          ...payload,
          senderUsername: sender?.username,
          senderImage: sender?.profile_image,
          postPreview,
        });

      } catch (err) {
        console.error("❌ Notification error:", err);
      }
    });

    // typing events
    socket.on("typing", (p) => io.to(`user:${p.to}`).emit("typing", p));
    socket.on("stop:typing", (p) => io.to(`user:${p.to}`).emit("stop:typing", p));

    // Handle disconnect
    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      set?.delete(socket.id);

      if (set?.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:offline", { userId });
      }
    });
  });

  const PORT = Number(process.env.PORT) || 3001;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Socket server running on port", PORT);
  });
}

startSocketServer();
