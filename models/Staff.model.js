import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        phone: { type: String, required: true },
        gender: {
            type: String,
            required: true
        },
        email: { type: String, required: true, unique: true },
        position: { type: String, required: true },
        address: { type: String },
        start_time: { type: String, required: true },
        end_time: { type: String, required: true },
        salary: { type: Number, required: true },
        status: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// export default mongoose.model("Staff", staffSchema);
const Staff = mongoose.model("Staff", staffSchema);
export default Staff;