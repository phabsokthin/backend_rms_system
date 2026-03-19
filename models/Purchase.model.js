import mongoose from "mongoose";

// Embedded Purchase Items Schema
const purchaseItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Main Purchase Schema
const purchaseSchema = new mongoose.Schema(
  {
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    payment_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentType",
      required: true,
    },

    purchase_date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    items: [purchaseItemSchema], // Embedded purchase items

    total_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },

    tax: {
      type: String,
      default: 0,
      // min: 0,
    },

    discount: {
      type: String,
      default: 0,
      // min: 0,
    },
    payment: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
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


// export default mongoose.model("Purchase", purchaseSchema);
const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;