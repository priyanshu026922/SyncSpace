import mongoose from "mongoose";

const canvasSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        shared: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        elements: [{ type: mongoose.Schema.Types.Mixed }],
        name: { type: String, default: "Untitled Canvas" },
        thumbnail: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Canvas", canvasSchema);