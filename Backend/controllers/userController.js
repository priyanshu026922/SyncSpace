import { createUser, validateUser } from "../services/userService.js";
import { signToken } from "../utils/jwt.js";
import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Missing fields" });

        const user = await createUser(email, password);
        const token = signToken({ userId: user._id });

        // Return token so the frontend can auto-login
        res.status(201).json({ message: "Registered", token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Missing fields" });

        const user = await validateUser(email, password);
        const token = signToken({ userId: user._id });

        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getUser = async (req, res) => {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
};