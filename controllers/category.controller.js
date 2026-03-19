import Category from "../models/Category.model.js";
import Product from "../models/Product.model.js";

// ===============================
// CREATE Category
// ===============================
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL Categories
// ===============================
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// UPDATE Category
// ===============================
const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body, // partial update allowed
      { new: true, runValidators: true }
    );

    if (!updatedCategory) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE Category
// ===============================
// const deleteCategory = async (req, res) => {
//   try {
//     const deletedCategory = await Category.findByIdAndDelete(req.params.id);
//     if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

//     res.json({ message: "Category deleted successfully", category: deletedCategory });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if any products reference this category
    const relatedProduct = await Product.findOne({ category_id: categoryId });
    if (relatedProduct) {
      return res.status(400).json({
        message: "Cannot delete category. There are products linked to this category.",
      });
    }

    // Delete category if no related product
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createCategory, getCategories, updateCategory, deleteCategory };