import express from "express";
import { createPaymentType, getPaymentTypes, updatePaymentType, deletePaymentType, getPaymentTypesActive } from "../controllers/paymentType.controller.js";

const router = express.Router();

router.post("/create", createPaymentType);
router.get("/get", getPaymentTypes);
router.get('/get-active', getPaymentTypesActive);
router.put("/update/:id", updatePaymentType);
router.delete("/delete/:id", deletePaymentType);

export default router;