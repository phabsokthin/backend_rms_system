import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false, // optional
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    payment_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentType",
    },

    expense_date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    currency: {
      type: String,
      default: "USD",
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);


const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;