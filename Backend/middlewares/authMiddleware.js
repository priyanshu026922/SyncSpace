import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ error: "No token" });

    try {
        const token = header.split(" ")[1];
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
};