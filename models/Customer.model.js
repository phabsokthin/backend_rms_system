import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
      trim: true, // optional
    },
    status: {
      type: Boolean,
      default: true, // active by default
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;