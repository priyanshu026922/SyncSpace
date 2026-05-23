import express from "express";
import {
    createCanvas,
    updateCanvas,
    loadCanvas,
    shareCanvas,
    unshareCanvas,
    deleteCanvas,
    getUserCanvases,
    getSharedCanvases,
    renameCanvas,
} from "../controllers/canvasController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCanvas);
router.put("/update", authMiddleware, updateCanvas);
router.get("/load/:id", authMiddleware, loadCanvas);
router.patch("/rename/:id", authMiddleware, renameCanvas);
router.put("/share/:id", authMiddleware, shareCanvas);
router.put("/unshare/:id", authMiddleware, unshareCanvas);
router.delete("/delete/:id", authMiddleware, deleteCanvas);
router.get("/list", authMiddleware, getUserCanvases);
router.get("/shared", authMiddleware, getSharedCanvases);

export default router;