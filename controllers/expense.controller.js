import Expense from "../models/Expense.model.js";

// ===============================
// CREATE EXPENSE
// ===============================
const createExpense = async (req, res) => {
    try {
        const { category_id, name, description, amount, payment_type_id, expense_date, status, currency } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Expense name is required" });
        }

        if (typeof amount !== "number" || amount < 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const validStatuses = ["pending", "paid", "cancelled"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const expense = await Expense.create({
            category_id: category_id || null,
            name,
            description: description || "",
            amount,
            payment_type_id: payment_type_id || null,
            expense_date: expense_date || Date.now(),
            status: status || "pending",
            currency
        });

        res.status(201).json({
            message: "Expense created successfully",
            data: expense,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create expense",
            error: error.message,
        });
    }
};

// ===============================
// GET ALL EXPENSES WITH CATEGORY & PAYMENT
// ===============================
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate("category_id")
            .populate("payment_type_id")
            .sort({ created_at: -1 }); // newest first

        res.json(expenses);
        // Or with a message wrapper:
        // res.status(200).json({
        //     message: "Expenses retrieved successfully",
        //     data: expenses,
        // });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get expenses",
            error: error.message,
        });
    }
};


// ===============================
// DELETE EXPENSE
// ===============================
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.status(200).json({
            message: "Expense deleted successfully",
            data: expense,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete expense",
            error: error.message,
        });
    }
};


// ===============================
// UPDATE EXPENSE
// ===============================
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, description, amount, payment_type_id, expense_date, status, currency } = req.body;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }


        if (name !== undefined && name.trim() === "") {
            return res.status(400).json({ message: "Expense name cannot be empty" });
        }

        if (amount !== undefined && (typeof amount !== "number" || amount < 0)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const validStatuses = ["pending", "paid", "cancelled"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        expense.category_id = category_id !== undefined ? category_id : expense.category_id;
        expense.name = name !== undefined ? name : expense.name;
        expense.description = description !== undefined ? description : expense.description;
        expense.amount = amount !== undefined ? amount : expense.amount;
        expense.payment_type_id = payment_type_id !== undefined ? payment_type_id : expense.payment_type_id;
        expense.expense_date = expense_date !== undefined ? expense_date : expense.expense_date;
        expense.status = status !== undefined ? status : expense.status;
        expense.currency = currency !== undefined ? currency : expense.currency;

        await expense.save();

        res.status(200).json({
            message: "Expense updated successfully",
            data: expense,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update expense",
            error: error.message,
        });
    }
};


// ===============================
// UPDATE EXPENSE STATUS ONLY
// ===============================
const updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const validStatuses = ["pending", "paid", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        expense.status = status;
        await expense.save();

        res.status(200).json({
            message: `Expense status updated to '${status}' successfully`,
            data: expense,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update expense status",
            error: error.message,
        });
    }
};



export { createExpense, getAllExpenses, deleteExpense, updateExpense, updateExpenseStatus };