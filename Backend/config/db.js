import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Connecting to DB...");
        
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ DB ERROR:", err.message);
        process.exit(1);
    }
};