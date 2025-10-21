import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { createBoard, deleteBoard, getBoard } from "./controller/BoardController";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://frontend:3000"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

app.use(
  express.json(),
  cors({
    origin: ["http://localhost:3000", "http://frontend:3000"],
    credentials: true,
  })
);

interface HelloResponse {
  message: string;
}

app.get("/api/hello", (_req: Request, res: Response<HelloResponse>) => {
  res.json({ message: "Hello from Express Backend!" });
});

/* BOARD Endpoints */
app.get("/board/:id", getBoard);
app.post("/board", createBoard);
app.delete("/board/:id", deleteBoard);

interface NotificationMessage {
  message: string;
}

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Broadcast notification every second
setInterval(() => {
  const notification: NotificationMessage = {
    message: "Server notification: " + new Date().toLocaleString(),
  };
  io.emit("notification", notification);
}, 1000);

const PORT = process.env.PORT || 3001;

// Init Sqlite db
AppDataSource.initialize()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  });