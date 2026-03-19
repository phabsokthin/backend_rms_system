import mongoose from "mongoose";

const salesOrderItemSchema = new mongoose.Schema(
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

const salesOrderSchema = new mongoose.Schema(
    {
        table_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true,
        },

        staff_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true,
        },

        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0, // optional
        },

        discount: {
            type: Number,
            default: 0,
            min: 0, // optional
        },


        items: [salesOrderItemSchema], // Embedded order items

        total_amount: {
            type: String,
            default: 0,
            // min: 0,
        },
        payment: {
            type: Number,
            default: 0,
            min: 0,
        },

        payment_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentType",
        },

        status: {
            type: String,
            default: "pending",
        },

        order_time: {
            type: Date,
            default: Date.now,
        },

        done_time: {
            type: Date, // optional

        },

        paid_time: {
            type: Date,
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


// export default mongoose.model("SalesOrder", salesOrderSchema);
const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
export default SalesOrder;