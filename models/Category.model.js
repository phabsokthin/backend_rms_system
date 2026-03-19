import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true, // remove space
        },
        description: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;

