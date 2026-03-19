import express from "express";
import { createCustomer, getCustomers, updateCustomer, deleteCustomer,getCustomersActive } from "../controllers/customer.controller.js";

const router = express.Router();
router.post("/create", createCustomer);
router.get("/get", getCustomers);
router.get('/get-active', getCustomersActive);
router.put("/update/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

export default router;