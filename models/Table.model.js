import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    table_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1, // min 1
    },
    status: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
    draft: {
      type: String,
      trim: true, // optional
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// export default mongoose.model("Table", tableSchema);

const Table = mongoose.model("Table", tableSchema);
export default Table;