import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number, // double → Number
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },

    qty: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },

    is_manage_stock: {
      type: Boolean,
      default: true,
    },
    alert_stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: Boolean,
      default: true, // active by default
    },

    image_url: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// export default mongoose.model("Product", productSchema);
const Product = mongoose.model("Product", productSchema);
export default Product;