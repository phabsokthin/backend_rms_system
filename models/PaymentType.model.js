import mongoose from "mongoose";

const paymentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // cash, card, QR, etc.
      trim: true,
    },
    status: {
      type: Boolean,
      default: true, 
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// export default mongoose.model("PaymentType", paymentTypeSchema);
const PaymentType = mongoose.model("PaymentType", paymentTypeSchema);
export default PaymentType;