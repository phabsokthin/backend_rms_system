
import express from "express";
import { createExpense, deleteExpense, getAllExpenses, updateExpense, updateExpenseStatus } from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/create", createExpense);
router.get('/get', getAllExpenses);
router.put("/update/:id", updateExpense);
router.patch("/update/:id/status", updateExpenseStatus);
router.delete('/delete/:id', deleteExpense);

export default router;