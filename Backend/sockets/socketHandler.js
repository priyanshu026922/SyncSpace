import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import Canvas from "../models/canvasModel.js";

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    const canvasCache = {};

    io.on("connection", (socket) => {

        socket.on("joinCanvas", async ({ canvasId, token }) => {
            try {
                const decoded = verifyToken(token);
                const userId = decoded.userId;

                const canvas = await Canvas.findById(canvasId);
                if (!canvas) return socket.emit("error", "Not found");

                const allowed =
                    String(canvas.owner) === userId ||
                    canvas.shared.includes(userId);

                if (!allowed) return socket.emit("unauthorized");

                socket.join(canvasId);

                socket.emit(
                    "loadCanvas",
                    canvasCache[canvasId] || canvas.elements
                );

            } catch {
                socket.emit("unauthorized");
            }
        });

        socket.on("drawingUpdate", async ({ canvasId, elements }) => {
            canvasCache[canvasId] = elements;

            await Canvas.findByIdAndUpdate(canvasId, { elements });

            socket.to(canvasId).emit("drawingUpdate", elements);
        });
    });
};