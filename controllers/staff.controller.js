import Staff from "../models/Staff.model.js";
import SalesOrder from "../models/SaleOrder.model.js";

// ===============================
// CREATE STAFF
// ===============================
const createStaff = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone,
            gender,
            email,
            position,
            address,
            start_time,
            end_time,
            salary,
            status,
            
        } = req.body;

        // Validate required fields
        if (
            !first_name ||
            !last_name ||
            !phone ||
            !gender ||
            !email ||
            !position ||
            !start_time ||
            !end_time ||
            salary === undefined
        ) {
            return res.status(400).json({
                message: "All required fields must be filled",
            });
        }

        // Check if email already exists
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        // Create new staff
        const newStaff = await Staff.create({
            first_name,
            last_name,
            phone,
            gender,
            email,
            position,
            address,
            start_time,
            end_time,
            salary,
            status,
        });

        res.status(201).json({
            message: "Staff created successfully",
            data: newStaff,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

// ===============================
// GET ALL STAFF
// ===============================
const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find({}).sort({ created_at: -1 });

        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


// ===============================
// UPDATE STAFF Active
// ===============================
const getAllStaffActive = async (req, res) => {
  try {
    const staff = await Staff.find({ status: true }).sort({ created_at: -1 });

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE STAFF
// ===============================
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        // Check if staff exists first
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // If email is being updated
        if (email && email !== staff.email) {
            const emailExists = await Staff.findOne({ email });

            if (emailExists) {
                return res.status(409).json({
                    message: "Email already exists",
                });
            }
        }

        // Update staff
        const updatedStaff = await Staff.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Staff updated successfully",
            data: updatedStaff,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ===============================
// DELETE STAFF
// ===============================

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check relation with SalesOrder
    const existingOrder = await SalesOrder.findOne({ staff_id: id });

    if (existingOrder) {
      return res.status(400).json({
        message: "Cannot delete staff because it is used in a sales order",
      });
    }

    const deleted = await Staff.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Staff deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// EXPORT
// ===============================
export {
    createStaff,
    getAllStaff,
    updateStaff,
    deleteStaff,
    getAllStaffActive
};