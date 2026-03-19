import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/config.js';
import cors from 'cors';
import authRoute from './routes/auth.route.js';
import staffRoute from './routes/staff.route.js';
import authMiddleware from './middleware/auth.middleware.js';
import tableRoute from './routes/table.route.js';
import categoryRoute from './routes/category.route.js';
import paymentTypeRoute from './routes/paymentType.route.js';
import supplierRoute from './routes/supplier.route.js';
import customerRoute from './routes/customer.route.js';
import productRoute from './routes/product.route.js';
import sellOrderRoute from './routes/sell_order.route.js';
import purchaseRoute from './routes/purchase.route.js';
import expenseRoute from './routes/expense.route.js';
import reportRoute  from "./routes/report.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

// app.use(cors());
app.use(cors({
  origin: "http://localhost:5001", // allow only this origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // optional: specify allowed methods
  credentials: true // optional: allow cookies
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// auth
app.use('/auth', authRoute);
// staff
app.use("/staff", authMiddleware, staffRoute)
// table
app.use("/table",authMiddleware, tableRoute)
//category
app.use("/category", authMiddleware, categoryRoute)

// paymentType
app.use("/paymentType", authMiddleware, paymentTypeRoute)
// supplier
app.use("/supplier", authMiddleware, supplierRoute)
// customer
app.use("/customer", authMiddleware, customerRoute)
// product
app.use('/product', authMiddleware, productRoute);
// sellOrder
app.use("/sellOrder", authMiddleware, sellOrderRoute);

// purchase
app.use("/purchase", authMiddleware, purchaseRoute);
//expense
app.use("/expense", authMiddleware, expenseRoute);
//report
app.use("/report", authMiddleware, reportRoute);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));