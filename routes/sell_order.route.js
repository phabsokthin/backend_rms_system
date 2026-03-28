
import { createSalesOrder, deleteSalesOrder, getAllSalesOrders, setSellOrderDone, setSellOrderPaid, setSellOrderProcessing, updateSalesOrder,getSalesOrderById,getAllSalesOrdersPending,getAllSalesOrdersDone } from "../controllers/sellOrder.controller.js";
import express from "express";
const router = express.Router();

router.post("/create", createSalesOrder);
router.get("/get", getAllSalesOrders);
router.get('/get-pending', getAllSalesOrdersPending);
router.get("/get-done", getAllSalesOrdersDone);
// router.get("/get/:id", getSalesOrderById);
router.get("/get/:id", getSalesOrderById);
router.patch("/update/:id/processing", setSellOrderProcessing);
router.patch("/update/:id/done", setSellOrderDone);
router.patch("/update/:id/paid", setSellOrderPaid);
router.delete("/delete/:id", deleteSalesOrder);
router.put("/update/:id", updateSalesOrder);

export default router;