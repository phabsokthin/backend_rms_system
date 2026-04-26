
import Product from "../models/Product.model.js";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

// ===============================
// CREATE PRODUCT
// ===============================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      code,
      description,
      price,
      cost,
      qty,
      is_manage_stock,
      status,
      profit,
      alert_stock, unit
    } = req.body;

    let image_url = null;

    // If image uploaded
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    //store image in cloudinary
    //     if (req.file) {
    //   // Upload using the file path
    //   const result = await cloudinary.uploader.upload(req.file.path, {
    //     folder: 'products', // optional folder in Cloudinary
    //     resource_type: 'image',
    //   });

    //   image_url = result.secure_url;
    // }

    const product = await Product.create({
      name,
      category_id,
      code,
      description,
      price,
      cost,
      qty,
      is_manage_stock,
      status,
      profit,
      alert_stock,
      image_url,
      unit
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


// ===============================
// GET ALL PRODUCT
// ===============================
const getAllProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("category_id", "name") // only include category name
      .sort({ created_at: -1 });

    res.json(products);
    // res.json({
    //   data: products,
    //   total: products.length,
    // });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET ALL PRODUCT IS MANAGE STOCK
// ===============================

const getAllProductsManageStock = async (req, res) => {
  try {
    const products = await Product.find({ is_manage_stock: true })
      .populate("category_id", "name") // only include category name
      .sort({ created_at: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET ALL PRODUCT BUY STATUS TRUE
// ===============================

const getAllProductsBuyStatusTrue = async (req, res) => {
  try {
    // Fetch active products
    const products = await Product.find({
      status: true,
      $or: [
        { is_manage_stock: false },
        { is_manage_stock: true, qty: { $gt: 0 } },
      ],
    })
      .populate("category_id", "name")
      .sort({ created_at: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// UPDATE PRODUCT
// ===============================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {

      // unlink old image
      if (product.image_url) {
        const oldImagePath = path.join(
          process.cwd(),
          product.image_url.replace(/^\/+/, "")
        );

        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old image:", err.message);
        });
      }

      // Update new image URL
      product.image_url = `/uploads/${req.file.filename}`;
    }

    //  Update other fields
    const allowedFields = [
      "name",
      "category_id",
      "code",
      "description",
      "price",
      "cost",
      "qty",
      "is_manage_stock",
      "status",
      "profit",
      "alert_stock",
      "unit"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //  Remove old image if exists
    if (product.image_url) {

      const filePath = path.join(process.cwd(), product.image_url.replace(/^\/+/, ""));
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete image file:", err.message);
        } else {
          console.log("Image file deleted:", filePath);
        }
      });
    }
    await product.deleteOne();

    res.json({
      message: "Product and its image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllProductsManageStock,
  getAllProductsBuyStatusTrue
};