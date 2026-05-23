import Canvas from "../models/canvasModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

const isAuthorized = (canvas, userId) => {
    const ownerId = canvas.owner?._id ? canvas.owner._id.toString() : canvas.owner.toString();
    const isOwner = ownerId === userId;
    const isShared = canvas.shared.some(sharedUser => {
        const sharedId = sharedUser?._id ? sharedUser._id.toString() : sharedUser.toString();
        return sharedId === userId;
    });
    return isOwner || isShared;
};

export const createCanvas = async (req, res) => {
    try {
        const { name } = req.body;
        const canvas = await Canvas.create({
            owner: req.userId,
            shared: [],
            elements: [],
            name: name || "Untitled Canvas",
        });

        res.status(201).json({ canvasId: canvas._id, _id: canvas._id, name: canvas.name });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateCanvas = async (req, res) => {
    try {
        const { canvasId, elements, thumbnail } = req.body;

        const canvas = await Canvas.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Not found" });

        if (!isAuthorized(canvas, req.userId))
            return res.status(403).json({ error: "Unauthorized" });

        canvas.elements = elements;
        if (thumbnail !== undefined) canvas.thumbnail = thumbnail;
        await canvas.save();

        res.json({ message: "Updated" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const renameCanvas = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });

        const canvas = await Canvas.findById(req.params.id);
        if (!canvas) return res.status(404).json({ error: "Not found" });

        if (canvas.owner.toString() !== req.userId)
            return res.status(403).json({ error: "Only owner can rename" });

        canvas.name = name.trim();
        await canvas.save();

        res.json({ message: "Renamed", name: canvas.name });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const loadCanvas = async (req, res) => {
    try {
        const canvas = await Canvas.findById(req.params.id).populate("owner", "email").populate("shared", "email");
        if (!canvas) return res.status(404).json({ error: "Not found" });

        if (!isAuthorized(canvas, req.userId))
            return res.status(403).json({ error: "Unauthorized" });

        res.json(canvas);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const shareCanvas = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const canvas = await Canvas.findById(req.params.id);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        if (canvas.owner.toString() !== req.userId)
            return res.status(403).json({ error: "Only owner allowed" });

        if (canvas.owner.toString() === user._id.toString())
            return res.status(400).json({ error: "Cannot share with yourself" });

        const id = new mongoose.Types.ObjectId(user._id);

        if (canvas.shared.some(x => x.toString() === id.toString()))
            return res.status(400).json({ error: "Already shared" });

        canvas.shared.push(id);
        await canvas.save();

        res.json({ message: "Shared" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const unshareCanvas = async (req, res) => {
    try {
        const canvas = await Canvas.findById(req.params.id);
        if (!canvas) return res.status(404).json({ error: "Not found" });

        if (canvas.owner.toString() !== req.userId)
            return res.status(403).json({ error: "Only owner allowed" });

        canvas.shared = canvas.shared.filter(
            id => id.toString() !== req.body.userIdToRemove
        );

        await canvas.save();
        res.json({ message: "Unshared" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteCanvas = async (req, res) => {
    try {
        const canvas = await Canvas.findById(req.params.id);
        if (!canvas) return res.status(404).json({ error: "Not found" });

        if (canvas.owner.toString() !== req.userId)
            return res.status(403).json({ error: "Only owner allowed" });

        await canvas.deleteOne();
        res.json({ message: "Deleted" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getUserCanvases = async (req, res) => {
    try {
        const data = await Canvas.find({
            $or: [{ owner: req.userId }, { shared: req.userId }]
        })
            .populate("owner", "email")
            .populate("shared", "email")
            .sort({ updatedAt: -1 });

        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getSharedCanvases = async (req, res) => {
    try {
        const data = await Canvas.find({ shared: req.userId })
            .populate("owner", "email")
            .populate("shared", "email")
            .sort({ updatedAt: -1 });

        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};