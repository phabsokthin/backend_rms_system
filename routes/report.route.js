import express from "express";
import { getProductsBelowAlertStock, getAllSalesOrders,getPurchaseReport,getProfitAndLoseReport,getTopSellingProducts} from "../controllers/report.controller.js";

const router = express.Router();
router.get("/product-report", getProductsBelowAlertStock);
router.get("/sell-report", getAllSalesOrders);
router.get("/purchase-report", getPurchaseReport);
router.get("/profitAndlose-report", getProfitAndLoseReport);
router.get('/top-selling-product', getTopSellingProducts);

export default router;