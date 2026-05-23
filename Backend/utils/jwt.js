import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY;

export const signToken = (payload) => {
    console.log("payload in signToken", payload);
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};