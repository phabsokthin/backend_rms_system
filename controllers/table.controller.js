import Table from "../models/Table.model.js";
import SalesOrder from '../models/SaleOrder.model.js'

// ===============================
// CREATE Table
// ===============================
const createTable = async (req, res) => {
  try {
    const { table_number, capacity, status, location, draft } = req.body;

    if (!table_number || !capacity) {
      return res.status(400).json({ message: "Table number and capacity are required" });
    }

    const existingTable = await Table.findOne({ table_number });
    if (existingTable) {
      return res.status(409).json({ message: "Table number already exists" });
    }
    const table = new Table({ table_number, capacity, status, location, draft });
    await table.save();

    res.status(201).json({ message: "Table created successfully", table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// GET ALL Tables
// ===============================
const getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ACTIVE Tables
// ===============================
const getTablesActive = async (req, res) => {
  try {
    const tables = await Table.find({ status: true });

    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Update only status
// ===============================

const updateTableStatus = async (req, res) => {
  try {
    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!updatedTable) return res.status(404).json({ message: "Table not found" });

    res.json({ message: "Table updated successfully", table: updatedTable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// UPDATE Table
// ===============================
const updateTable = async (req, res) => {
  try {
    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      req.body, // partial update
      { new: true, runValidators: true }
    );

    if (!updatedTable) return res.status(404).json({ message: "Table not found" });

    res.json({ message: "Table updated successfully", table: updatedTable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE Table
// ===============================
const deleteTable = async (req, res) => {
  try {
    const tableId = req.params.id;

    // Check if table is used in SalesOrder
    const existingOrder = await SalesOrder.findOne({ table_id: tableId });

    if (existingOrder) {
      return res.status(400).json({
        message: "Cannot delete table because it is used in a sales order",
      });
    }

    const deletedTable = await Table.findByIdAndDelete(tableId);

    if (!deletedTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json({
      message: "Table deleted successfully",
      table: deletedTable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export { createTable, getTables, updateTable, deleteTable, getTablesActive, updateTableStatus};