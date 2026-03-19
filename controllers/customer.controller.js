import Customer from "../models/Customer.model.js";
import SalesOrder from "../models/SaleOrder.model.js";

// ===============================
// CREATE Customer
// ===============================
const createCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, status, notes } = req.body;

    if (!first_name) {
      return res.status(400).json({ message: "First name is required" });
    }

    const customerData = {
      first_name,
      last_name,
      phone,
      address,
      status,
      notes,
    };

    // Only add email if it exists
    if (email && email.trim() !== "") {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(409).json({ message: "Email already registered" });
      }

      customerData.email = email;
    }

    const customer = new Customer(customerData);

    await customer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL Customers
// ===============================
const getCustomers = async (req, res) => {
    try {

        let customers = await Customer.find().sort({ created_at: -1 });

        // move General Customers to the top
        customers.sort((a, b) => {
            if (a.first_name === "Gerneral" && a.last_name === "Customers") return -1;
            if (b.first_name === "Gerneral" && b.last_name === "Customers") return 1;
            return 0;
        });

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



// ===============================
// get all active customers
// ===============================
const getCustomersActive = async (req, res) => {
  try {

    // get only active customers
    let customers = await Customer.find({ status: true })
      .sort({ created_at: -1 });

    // move General Customers to the top
    customers.sort((a, b) => {
      if (a.first_name === "Gerneral" && a.last_name === "Customers") return -1;
      if (b.first_name === "Gerneral" && b.last_name === "Customers") return 1;
      return 0;
    });

    res.json(customers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE Customer
// ===============================
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) return res.status(404).json({ message: "Customer not found" });


        if (customer.first_name === "Gerneral" && customer.last_name === "Customers") {
            return res.status(403).json({ message: "Cannot update General Customers" });
        }


        if (req.body.first_name === "Gerneral" && req.body.last_name === "Customers") {
            return res.status(403).json({ message: "Cannot set name as General Customers" });
        }


        if (req.body.email) {
            const existingCustomer = await Customer.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
            if (existingCustomer) {
                return res.status(409).json({ message: "Email already registered by another customer" });
            }
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ message: "Customer updated successfully", customer: updatedCustomer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ===============================
// DELETE Customer
// ===============================

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Prevent deletion of General Customers
    if (
      customer.first_name === "Gerneral" &&
      customer.last_name === "Customers"
    ) {
      return res
        .status(403)
        .json({ message: "Cannot delete General Customers" });
    }

    // Check if customer is used in SalesOrder
    const existingOrder = await SalesOrder.findOne({ customer_id: id });

    if (existingOrder) {
      return res.status(400).json({
        message: "Cannot delete customer because it is used in a sales order",
      });
    }

    await customer.deleteOne();

    res.json({
      message: "Customer deleted successfully",
      customer,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export { createCustomer, getCustomers, updateCustomer, deleteCustomer, getCustomersActive };