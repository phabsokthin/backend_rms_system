import mongoose from "mongoose";
const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    contact_person: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    status: {
      type: Boolean,
      default: true, // active by default
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// export default mongoose.model("Supplier", supplierSchema);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
