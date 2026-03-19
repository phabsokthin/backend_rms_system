import Supplier from "../models/Supplies.model.js";
import Purchase from "../models/Purchase.model.js"; // adjust path

// ===============================
// CREATE Supplier
// ===============================
const createSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(409).json({ message: "Supplier already exists" });
    }

    const supplier = new Supplier({
      name,
      contact_person,
      phone,
      email,
      address,
      status,
    });

    await supplier.save();

    res.status(201).json({ message: "Supplier created successfully", supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL Suppliers
// ===============================
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL Suppliers active true
// ===============================

const getSuppliersActive = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: true });
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// UPDATE Supplier
// ===============================
const updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body, // partial updates allowed
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier updated successfully", supplier: updatedSupplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE Supplier
// ===============================

const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    // Check if any purchase exists with this supplier
    const existingPurchase = await Purchase.findOne({ supplier_id: supplierId });

    if (existingPurchase) {
      return res.status(400).json({
        message: "Cannot delete supplier because it is used in a purchase"
      });
    }

    // No purchase found, safe to delete
    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({
      message: "Supplier deleted successfully",
      supplier: deletedSupplier
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export { createSupplier, getSuppliers, updateSupplier, deleteSupplier,getSuppliersActive };