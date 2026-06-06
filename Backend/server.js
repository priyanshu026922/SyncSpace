import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import canvasRoutes from "./routes/canvasRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";   
import { initSocket } from "./sockets/socketHandler.js";

const app = express();
const server = http.createServer(app);

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);
app.use("/api/ai", aiRoutes);                    

// db
console.log("Starting server...");

await connectDB();

console.log("DB connected");

initSocket(server);

server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
    res.send("Server is running ✅");
});