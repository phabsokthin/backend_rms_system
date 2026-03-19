

import express from "express";
import { createPurchase, deletePurchase, getAllPurchases, updatePurchase, updatePurchaseStatus } from "../controllers/purchase.controller.js";
const router = express.Router();
router.post("/create", createPurchase);
router.get("/get", getAllPurchases);
router.patch("/update/:id/received", updatePurchaseStatus);
router.put("/update/:id", updatePurchase);
router.delete("/delete/:id", deletePurchase);

export default router;