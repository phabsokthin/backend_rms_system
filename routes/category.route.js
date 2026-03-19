import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();

router.post("/post-category", createCategory);
router.get("/get-category", getCategories);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);

export default router;