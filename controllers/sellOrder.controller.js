import SalesOrder from "../models/SaleOrder.model.js";
import Product from "../models/Product.model.js";
import Table from "../models/Table.model.js";



// ===============================
// CREATE SALES ORDER
// ===============================
const createSalesOrder = async (req, res) => {
    try {
        const {
            table_id,
            staff_id,
            customer_id,
            items,
            tax = 0,
            discount = 0,
            notes,
            currency,
            payment,
            payment_type_id,
            total_amount
        } = req.body;

        if (!table_id || !staff_id || !customer_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items are required" });
        }

        let processedItems = [];
        let totalAmount = 0;

        // ===============================
        // Process Items
        // ===============================
        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.product_id}`,
                });
            }

            // Manage stock only if enabled
            if (product.is_manage_stock === true) {

                // Atomic update (prevent negative stock)
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product_id,
                        qty: { $gte: item.qty }, // ensure enough stock
                    },
                    { $inc: { qty: -item.qty } },
                    { new: true }
                );

                if (!updatedProduct) {
                    return res.status(400).json({
                        message: `Not enough stock for ${product.name}`,
                    });
                }
            }

            const subtotal = item.qty * product.price;

            processedItems.push({
                product_id: product._id,
                qty: item.qty,
                price: product.price,
                subtotal,
            });

            totalAmount += subtotal;
        }

        // ===============================
        // Apply Discount & Tax
        // ===============================
        // totalAmount -= discount;
        // totalAmount += tax;

        // if (totalAmount < 0) totalAmount = 0;

        // ===============================
        // Create Sales Order
        // ===============================
        const salesOrder = await SalesOrder.create({
            table_id,
            staff_id,
            customer_id,
            items: processedItems,
            tax,
            discount,
            // total_amount: totalAmount,
            total_amount,
            notes,
            currency,
            status: "pending",
            payment,
            payment_type_id
        });


        // Update table status to false (occupied)
        await Table.findByIdAndUpdate(table_id, { status: false });

        res.status(201).json({
            message: "Sales order created successfully",
            data: salesOrder,
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create sales order",
            error: error.message,
        });
    }
};


// ===============================
// GET ALL SALES ORDERS
// ===============================
const getAllSalesOrders = async (req, res) => {
    try {
        const salesOrders = await SalesOrder.find()
            .populate("table_id") // Table details
            .populate("staff_id") // Staff details
            .populate("customer_id") // Customer details
            .populate("payment_type_id") // Payment type
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" }
            })
            .sort({ order_time: -1 });

        res.status(200).json(salesOrders)
        // res.status(200).json({
        //     message: "Sales orders fetched successfully",
        //     data: salesOrders,
        // });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch sales orders",
            error: error.message,
        });
    }
};

// ===============================
// GET ALL SALES ORDERS By ID
// ===============================

const getSalesOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const salesOrder = await SalesOrder.findById(id)
            .populate("table_id")
            .populate("staff_id")
            .populate("customer_id")
            .populate("payment_type_id")
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" },
            });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        res.status(200).json(salesOrder)

        // res.status(200).json({
        //     message: "Sales order fetched successfully",
        //     data: salesOrder,
        // });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch sales order",
            error: error.message,
        });
    }
};




// ===============================
// MARK SALES ORDER Processing AS DONE From kitchen
// ===============================

const setSellOrderProcessing = async (req, res) => {
    try {

        const { id } = req.params;
        const salesOrder = await SalesOrder.findByIdAndUpdate(
            id,
            { status: "processing" },
            { new: true } // return updated document
        )
            .populate("table_id")
            .populate("staff_id")
            .populate("customer_id")
            .populate("payment_type_id")
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" },
            });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        res.status(200).json({
            message: "Sales order marked as done",
            data: salesOrder,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update sales order",
            error: error.message,
        });
    }
};


// ===============================
// MARK SALES ORDER AS DONE From kitchen
// ===============================
const setSellOrderDone = async (req, res) => {
    try {
        const { id } = req.params;

        const salesOrder = await SalesOrder.findById(id)
            .populate("table_id")
            .populate("staff_id")
            .populate("customer_id")
            .populate("payment_type_id")
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" },
            });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }


        if (salesOrder.status !== "processing") {
            return res.status(400).json({
                message: `Cannot mark as done because current status is '${salesOrder.status}'`,
            });
        }


        salesOrder.status = "done";
        salesOrder.done_time = new Date();
        await salesOrder.save();

        res.status(200).json({
            message: "Sales order marked as done",
            data: salesOrder,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update sales order",
            error: error.message,
        });
    }
};

// ===============================
// SET PAID ORDER AS DONE From kitchen
// ===============================

const setSellOrderPaid = async (req, res) => {
    try {
        const { id } = req.params;

        const salesOrder = await SalesOrder.findById(id);

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        if (salesOrder.status !== "done") {
            return res.status(400).json({
                message: `Cannot mark as paid because current status is '${salesOrder.status}'`,
            });
        }

        const updatedOrder = await SalesOrder.findByIdAndUpdate(
            id,
            { status: "paid", paid_time: new Date() },
            { new: true }
        )
            .populate("table_id")
            .populate("staff_id")
            .populate("customer_id")
            .populate("payment_type_id")
            .populate({
                path: "items.product_id",
                populate: { path: "category_id" },
            });

        res.status(200).json({
            message: "Sales order marked as paid successfully",
            data: updatedOrder,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update paid order",
            error: error.message,
        });
    }
};


// ===============================
// DELETE SALES ORDER
// ===============================
const deleteSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;


        const salesOrder = await SalesOrder.findById(id);

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        for (const item of salesOrder.items) {
            const product = await Product.findById(item.product_id);
            // restore stock if product is manage stock
            if (product && product.is_manage_stock === true) {
                // Restore the stock
                product.qty += item.qty;
                await product.save();
            }
        }

        await SalesOrder.findByIdAndDelete(id);

        // Update table status to true (available)
        if (salesOrder.table_id) {
            await Table.findByIdAndUpdate(salesOrder.table_id, { status: true });
        }

        res.status(200).json({
            message: "Sales order deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete sales order",
            error: error.message,
        });
    }
};



// ===============================
// UPDATE SALES ORDER
// ===============================
// const updateSalesOrder = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { items, tax, discount, notes, staff_id, customer_id, payment, payment_type_id, currency, table_id } = req.body;


//         const salesOrder = await SalesOrder.findById(id);

//         if (!salesOrder) {
//             return res.status(404).json({ message: "Sales order not found" });
//         }

//         // 
//         if (!["pending", "processing"].includes(salesOrder.status)) {
//             return res.status(400).json({
//                 message: `Cannot update sales order with status '${salesOrder.status}'`,
//             });
//         }


//         let totalAmount = 0;
//         let processedItems = [];
//         if (items && items.length > 0) {
//             for (const item of items) {
//                 const product = await Product.findById(item.product_id);

//                 if (!product) {
//                     return res.status(404).json({ message: `Product not found: ${item.product_id}` });
//                 }

//                 // Check stock if managed
//                 if (product.is_manage_stock === true) {
//                     const existingItem = salesOrder.items.find(i => i.product_id.toString() === item.product_id);
//                     const oldQty = existingItem ? existingItem.qty : 0;
//                     const qtyChange = item.qty - oldQty;


//                     if (qtyChange > 0 && product.qty < qtyChange) {
//                         return res.status(400).json({ message: `Not enough stock for ${product.name}` });
//                     }

//                     // Update stock
//                     product.qty -= qtyChange;
//                     await product.save();
//                 }

//                 const subtotal = item.qty * product.price;
//                 processedItems.push({
//                     product_id: product._id,
//                     qty: item.qty,
//                     price: product.price,
//                     subtotal,
//                 });
//                 totalAmount += subtotal;
//             }

//             // Replace items in order
//             salesOrder.items = processedItems;
//         } else {
//             // Keep old items and recalculate total
//             totalAmount = salesOrder.items.reduce((sum, i) => sum + i.subtotal, 0);
//         }

//         salesOrder.discount = discount ?? salesOrder.discount;
//         salesOrder.tax = tax ?? salesOrder.tax;
//         totalAmount = totalAmount - salesOrder.discount + salesOrder.tax;
//         salesOrder.total_amount = totalAmount >= 0 ? totalAmount : 0;

//         if (table_id !== undefined) {
//             salesOrder.table_id = table_id;
//         }
//         if (staff_id !== undefined) {
//             salesOrder.staff_id = staff_id;
//         }
//         if (customer_id !== undefined) {
//             salesOrder.customer_id = customer_id;
//         }
//         if (payment !== undefined) {
//             salesOrder.payment = payment;
//         }
//         if (payment_type_id !== undefined) {
//             salesOrder.payment_type_id = payment_type_id;
//         }
//         if (currency !== undefined) {
//             salesOrder.currency = currency;
//         }

//         if (notes !== undefined) salesOrder.notes = notes;

//         await Table.findByIdAndUpdate(salesOrder.table_id, { status: false });

//         await salesOrder.save();



//         res.status(200).json({
//             message: "Sales order updated successfully",
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Failed to update sales order",
//             error: error.message,
//         });
//     }
// };



const updateSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, tax, discount, notes, staff_id, customer_id, payment, payment_type_id, currency, table_id, total_amount } = req.body;

        const salesOrder = await SalesOrder.findById(id);

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        if (!["pending", "processing"].includes(salesOrder.status)) {
            return res.status(400).json({
                message: `Cannot update sales order with status '${salesOrder.status}'`,
            });
        }

        let totalAmount = 0;
        let processedItems = [];

        if (items && items.length > 0) {

            // ===== Restore stock for removed items =====
            for (const oldItem of salesOrder.items) {

                const stillExists = items.find(
                    i => i.product_id.toString() === oldItem.product_id.toString()
                );

                if (!stillExists) {
                    const product = await Product.findById(oldItem.product_id);

                    if (product && product.is_manage_stock) {
                        product.qty += oldItem.qty;
                        await product.save();
                    }
                }
            }

            // ===== Process new items =====
            for (const item of items) {

                const product = await Product.findById(item.product_id);

                if (!product) {
                    return res.status(404).json({
                        message: `Product not found: ${item.product_id}`
                    });
                }

                if (product.is_manage_stock === true) {

                    const existingItem = salesOrder.items.find(
                        i => i.product_id.toString() === item.product_id.toString()
                    );

                    const oldQty = existingItem ? existingItem.qty : 0;
                    const qtyChange = item.qty - oldQty;

                    // Check stock
                    if (qtyChange > 0 && product.qty < qtyChange) {
                        return res.status(400).json({
                            message: `Not enough stock for ${product.name}`
                        });
                    }

                    // Update stock
                    product.qty -= qtyChange;
                    await product.save();
                }

                const subtotal = item.qty * product.price;

                processedItems.push({
                    product_id: product._id,
                    qty: item.qty,
                    price: product.price,
                    subtotal,
                });

                totalAmount += subtotal;
            }

            salesOrder.items = processedItems;

        } else {
            totalAmount = salesOrder.items.reduce((sum, i) => sum + i.subtotal, 0);
        }

        // // =====  Calculate total =====
        // salesOrder.discount = discount ?? salesOrder.discount;
        // salesOrder.tax = tax ?? salesOrder.tax;

        // totalAmount = totalAmount - salesOrder.discount + salesOrder.tax;
        // salesOrder.total_amount = totalAmount >= 0 ? totalAmount : 0;

        // ===== Update fields =====
        if (table_id !== undefined) salesOrder.table_id = table_id;
        if (staff_id !== undefined) salesOrder.staff_id = staff_id;
        if (customer_id !== undefined) salesOrder.customer_id = customer_id;
        if (payment !== undefined) salesOrder.payment = payment;
        if (payment_type_id !== undefined) salesOrder.payment_type_id = payment_type_id;
        if (currency !== undefined) salesOrder.currency = currency;
        if (notes !== undefined) salesOrder.notes = notes;
        if (tax !== undefined) salesOrder.tax = tax;
        if (discount !== undefined) salesOrder.discount = discount;
        if (total_amount !== undefined) salesOrder.total_amount = total_amount;

        // =====  Update table status =====
        await Table.findByIdAndUpdate(salesOrder.table_id, { status: false });

        await salesOrder.save();

        res.status(200).json({
            message: "Sales order updated successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update sales order",
            error: error.message,
        });
    }
};



export { createSalesOrder, getAllSalesOrders, setSellOrderProcessing, setSellOrderDone, setSellOrderPaid, deleteSalesOrder, updateSalesOrder, getSalesOrderById };