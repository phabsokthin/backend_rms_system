import express from "express";
import { createTable, getTables, updateTable, deleteTable, getTablesActive,updateTableStatus } from "../controllers/table.controller.js";

const router = express.Router();

router.post("/create-table", createTable);
router.get("/get-table", getTables);
router.get('/get-active', getTablesActive);
router.patch("/update-table/:id/status", updateTableStatus);
router.patch("/update-table/:id", updateTable);
router.delete("/delete-table/:id", deleteTable);

export default router;