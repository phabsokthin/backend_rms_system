

import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getAllProductsManageStock,
    getAllProductsBuyStatusTrue,
    updateProduct,
} from "../controllers/product.controller.js";
import upload from "../middleware/upload.middleware.js";
const router = express.Router();

router.post("/create", upload.single("image"), createProduct);
router.get('/get', getAllProducts);
router.get('/get-manage-stock', getAllProductsManageStock);
router.get('/get-product-true', getAllProductsBuyStatusTrue);
router.delete('/delete/:id', deleteProduct);

router.put("/update/:id", upload.single("image"), updateProduct);

export default router;