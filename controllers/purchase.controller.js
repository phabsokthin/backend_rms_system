import Purchase from "../models/Purchase.model.js";
import Product from "../models/Product.model.js";

// ===============================
// CREATE PURCHASE
// ===============================

const createPurchase = async (req, res) => {
    try {
        const { supplier_id, purchase_date, items, notes, status = "pending", currency, tax, discount, payment, payment_type_id } = req.body;

        // Validate supplier
        if (!supplier_id) {
            return res.status(400).json({ message: "Supplier is required" });
        }
        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Purchase items are required" });
        }

        if (!["pending", "received", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid purchase status" });
        }

        let processedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product_id}` });
            }

            // Validate qty and price
            if (typeof item.qty !== "number" || item.qty <= 0) {
                return res.status(400).json({ message: `Invalid qty for product ${product.name}` });
            }
            if (typeof item.price !== "number" || item.price < 0) {
                return res.status(400).json({ message: `Invalid price for product ${product.name}` });
            }

            const subtotal = item.qty * item.price;

            processedItems.push({
                product_id: product._id,
                qty: item.qty,
                price: item.price,
                subtotal,
            });

            totalAmount += subtotal;

            if (status === "received" && product.is_manage_stock === true) {
                product.qty += item.qty;
                await product.save();
            }
        }

        // Create purchase
        const purchase = await Purchase.create({
            supplier_id,
            purchase_date: purchase_date || Date.now(),
            items: processedItems,
            total_amount: totalAmount,
            notes,
            status,
            currency,
            tax,
            discount,
            payment_type_id,
            payment,

        });

        res.status(201).json({
            message: `Purchase created successfully with status '${status}'`,
            data: purchase,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create purchase",
            error: error.message,
        });
    }
};


// ===============================
// GET ALL PURCHASE
// ===============================

const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate("supplier_id")
            .populate("payment_type_id")
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" },

            })
            .sort({ created_at: -1 }); // newest first

        res.status(200).json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch purchases", error: error.message });
    }
};


// ===============================
// DELETE ALL PURCHASE
// ===============================
// const deletePurchase = async (req, res) => {
//     try {
//         const { id } = req.params;


//         const purchase = await Purchase.findById(id);
//         if (!purchase) {
//             return res.status(404).json({ message: "Purchase not found" });
//         }

//         // Restore stock for each product if managed
//         for (const item of purchase.items) {
//             const product = await Product.findById(item.product_id);

//             if (product && product.is_manage_stock === true) {
//                 product.qty -= item.qty;
//                 if (product.qty < 0) product.qty = 0;
//                 await product.save();
//             }
//         }

//         // Delete the purchase
//         await Purchase.findByIdAndDelete(id);
//         res.status(200).json({ message: "Purchase deleted successfully" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Failed to delete purchase",
//             error: error.message,
//         });
//     }
// };


const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;

        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        // Adjust stock depending on purchase status
        for (const item of purchase.items) {
            const product = await Product.findById(item.product_id);

            if (product && product.is_manage_stock === true) {
                if (purchase.status === "received") {
                    // If purchase was received, reduce stock
                    product.qty -= item.qty;
                    if (product.qty < 0) product.qty = 0;
                }
                await product.save();
            }
        }

        // Delete the purchase
        await Purchase.findByIdAndDelete(id);
        res.status(200).json({ message: "Purchase deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete purchase",
            error: error.message,
        });
    }
};


// ===============================
// UPDATR PURCHASE RECEIVED
// ===============================
const updatePurchaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!["pending", "received", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }


        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        // Optionally: if status changes from other → "received", add stock
        if (status === "received" && purchase.status !== "received") {
            for (const item of purchase.items) {
                const product = await Product.findById(item.product_id);
                if (product && product.is_manage_stock === true) {
                    product.qty += item.qty;
                    await product.save();
                }
            }
        }

        // Optionally: if status changes from "received" → other, reduce stock
        if (purchase.status === "received" && status !== "received") {
            for (const item of purchase.items) {
                const product = await Product.findById(item.product_id);
                if (product && product.is_manage_stock === true) {
                    product.qty -= item.qty;
                    if (product.qty < 0) product.qty = 0;
                    await product.save();
                }
            }
        }

        // Update status
        purchase.status = status;
        await purchase.save();

        res.status(200).json({
            message: `Purchase status updated to '${status}' successfully`,
            data: purchase,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update purchase status",
            error: error.message,
        });
    }
}


// ===============================
// UPDATR PURCHASE  
// ===============================
const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_id, purchase_date, items, notes, status, payment, payment_type_id, currency, tax, discount } = req.body;

        // Find existing purchase
        const purchase = await Purchase.findById(id);
        if (!purchase) return res.status(404).json({ message: "Purchase not found" });

        // Validate status
        const validStatuses = ["pending", "received", "cancelled"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        let processedItems = [];
        let totalAmount = 0;

        if (items && items.length > 0) {
            for (const item of items) {
                const product = await Product.findById(item.product_id);
                if (!product) return res.status(404).json({ message: `Product not found: ${item.product_id}` });

                if (typeof item.qty !== "number" || item.qty <= 0) {
                    return res.status(400).json({ message: `Invalid qty for product ${product.name}` });
                }
                if (typeof item.price !== "number" || item.price < 0) {
                    return res.status(400).json({ message: `Invalid price for product ${product.name}` });
                }


                // we cannot use originalItem.qty because it is not updated yet 
                const originalItem = purchase.items.find(i => i.product_id.toString() === item.product_id);
                if (originalItem && item.qty > originalItem.qty) {
                    return res.status(400).json({
                        message: `Qty for product ${product.name} cannot exceed original purchase qty (${originalItem.qty})`,
                    });
                }

                const subtotal = item.qty * item.price;
                processedItems.push({
                    product_id: product._id,
                    qty: item.qty,
                    price: item.price,
                    subtotal,
                });

                totalAmount += subtotal;

                // Calculate stock delta ONLY if status is received and manages stock
                if (product.is_manage_stock) {
                    let delta = 0;
                    if (status === "received") {
                        const oldQty = originalItem ? originalItem.qty : 0;
                        delta = item.qty - oldQty; // difference
                        product.qty += delta; // adjust stock by difference
                        if (product.qty < 0) product.qty = 0;
                        await product.save();
                    }

                    if (status === "cancelled") {
                        // When cancelling, reduce stock by the original qty
                        const oldQty = originalItem ? originalItem.qty : 0;
                        product.qty -= oldQty;
                        if (product.qty < 0) product.qty = 0;
                        await product.save();
                    }
                }
            }
        } else {
            processedItems = purchase.items;
            totalAmount = purchase.total_amount;
        }

        // Update purchase fields
        purchase.supplier_id = supplier_id || purchase.supplier_id;
        purchase.purchase_date = purchase_date || purchase.purchase_date;
        purchase.items = processedItems;
        purchase.total_amount = totalAmount;
        purchase.notes = notes || purchase.notes;
        purchase.status = status || purchase.status;
        purchase.payment = payment || purchase.payment;
        purchase.payment_type_id = payment_type_id || purchase.payment_type_id;
        purchase.currency = currency || purchase.currency;
        purchase.tax = tax || purchase.tax;
        purchase.discount = discount || purchase.discount;

        await purchase.save();

        res.status(200).json({
            message: "Purchase updated successfully",
            data: purchase,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update purchase",
            error: error.message,
        });
    }
};



export { createPurchase, getAllPurchases, deletePurchase, updatePurchaseStatus, updatePurchase };