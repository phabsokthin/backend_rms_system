import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            required: true,
            enum: ["normal", "kitchen", "admin"],
            default: "normal"
        },
        status: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);


const User = mongoose.model("Users", userSchema);
export default User;