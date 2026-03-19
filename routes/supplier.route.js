import express from "express";
import { createSupplier, getSuppliers, updateSupplier, deleteSupplier,getSuppliersActive } from "../controllers/supplier.controller.js";

const router = express.Router();

router.post("/create", createSupplier);
router.get("/get", getSuppliers);
router.get('/get-active', getSuppliersActive);
router.put("/update/:id", updateSupplier);
router.delete("/delete/:id", deleteSupplier);


export default router;