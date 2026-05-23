import User from "../models/userModel.js";

export const createUser = async (email, password) => {
    const exists = await User.findOne({ email });
    if (exists) throw new Error("User exists");

    const user = await new User({ email, password });

    return user.save();
};

export const validateUser = async (email, password) => {
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) throw new Error("User with this email does not exist");

    const match = await user.comparePassword(password);
    if (!match) throw new Error("Invalid credentials");

    return user;
};