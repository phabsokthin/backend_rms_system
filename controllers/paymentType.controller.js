import PaymentType from "../models/PaymentType.model.js";
import SalesOrder from "../models/SaleOrder.model.js";


// ===============================
// CREATE PaymentType
// ===============================
const createPaymentType = async (req, res) => {
  try {
    const { name, status, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Payment type name is required" });
    }

    const existingType = await PaymentType.findOne({ name });
    if (existingType) {
      return res.status(409).json({ message: "Payment type already exists" });
    }

    const paymentType = new PaymentType({ name, status, description });
    await paymentType.save();

    res.status(201).json({ message: "Payment type created successfully", paymentType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL PaymentTypes
// ===============================
const getPaymentTypes = async (req, res) => {
  try {
    const paymentTypes = await PaymentType.find();
    res.json(paymentTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL PaymentTypes active
// ===============================
const getPaymentTypesActive = async (req, res) => {
  try {
    const paymentTypes = await PaymentType.find({ status: true });

    res.json(paymentTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE PaymentType
// ===============================
const updatePaymentType = async (req, res) => {
  try {
    const updatedType = await PaymentType.findByIdAndUpdate(
      req.params.id,
      req.body, // allows partial updates
      { new: true, runValidators: true }
    );

    if (!updatedType) return res.status(404).json({ message: "Payment type not found" });

    res.json({ message: "Payment type updated successfully", paymentType: updatedType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE PaymentType
// ===============================
const deletePaymentType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment type is used in SalesOrder
    const existingOrder = await SalesOrder.findOne({ payment_type_id: id });

    if (existingOrder) {
      return res.status(400).json({
        message: "Cannot delete payment type because it is used in a sales order",
      });
    }

    const deletedType = await PaymentType.findByIdAndDelete(id);

    if (!deletedType) {
      return res.status(404).json({ message: "Payment type not found" });
    }

    res.json({
      message: "Payment type deleted successfully",
      paymentType: deletedType,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createPaymentType, getPaymentTypes, updatePaymentType, deletePaymentType,getPaymentTypesActive};