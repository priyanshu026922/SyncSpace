import mongoose from "mongoose";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }
});

schema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = function (pw) {
    return bcrypt.compare(pw, this.password);
};

export default mongoose.model("User", schema);