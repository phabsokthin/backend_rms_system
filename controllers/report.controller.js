import Product from "../models/Product.model.js";
import SalesOrder from "../models/SaleOrder.model.js";
import Purchase from "../models/Purchase.model.js";
import Expense from "../models/Expense.model.js";
// ===============================
// GET PRODUCTS BELOW ALERT STOCK
// ===============================
const getProductsBelowAlertStock = async (req, res) => {
  try {
    const products = await Product.find({
      is_manage_stock: true,
      $expr: { $lte: ["$qty", "$alert_stock"] } // qty <= alert_stock
    })
      .populate("category_id", "name")
      .sort({ created_at: -1 });

    res.status(200).json(products);
    // res.status(200).json({
    //     message: "Products below or equal to alert stock",
    //     data: products,
    //     total: products.length,
    // });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ===============================
// GET ALL SALES ORDERS WITH REPORT (by currency)
// ===============================
const getAllSalesOrders = async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find()
      .populate("table_id")
      .populate("staff_id")
      .populate("customer_id")
      .populate("payment_type_id")
      .populate({
        path: "items.product_id",
        populate: { path: "category_id" }
      })
      .sort({ order_time: -1 });

    // Overall totals
    const totalOrders = salesOrders.length;
    const totalAmount = salesOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const totalPayment = salesOrders.reduce((sum, order) => sum + Number(order.payment || 0), 0);
    const totalBalance = totalAmount - totalPayment;

    // Group by currency
    const reportByCurrency = salesOrders.reduce((acc, order) => {
      const currency = order.currency || "usd"; // default fallback
      if (!acc[currency]) {
        acc[currency] = {
          totalOrders: 0,
          totalAmount: 0,
          totalPayment: 0,
          totalBalance: 0,
        };
      }
      acc[currency].totalOrders += 1;
      acc[currency].totalAmount += Number(order.total_amount || 0);
      acc[currency].totalPayment += Number(order.payment || 0);
      acc[currency].totalBalance = acc[currency].totalAmount - acc[currency].totalPayment;
      return acc;
    }, {});

    res.status(200).json({
      message: "Sales orders fetched successfully",
      data: salesOrders,
      report: {
        overall: {
          totalOrders,
          totalAmount,
          totalPayment,
          totalBalance,
        },
        byCurrency: reportByCurrency,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sales orders",
      error: error.message,
    });
  }
};



// ===============================
// GET PURCHASE REPORT BY CURRENCY
// ===============================
const getPurchaseReport = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier_id")
      .populate("payment_type_id")
      .populate({
        path: "items.product_id",
        populate: { path: "category_id" },
      })
      .sort({ created_at: -1 });

    // Initialize report structure
    const report = {
      overall: {
        totalOrders: 0,
        totalAmount: 0,
        totalPayment: 0,
        totalBalance: 0,
      },
      byCurrency: {},
    };

    purchases.forEach(purchase => {
      const { currency, total_amount, payment } = purchase;

      // Overall totals
      report.overall.totalOrders += 1;
      report.overall.totalAmount += total_amount;
      report.overall.totalPayment += payment;
      report.overall.totalBalance += payment - total_amount;

      // Currency-specific totals
      if (!report.byCurrency[currency]) {
        report.byCurrency[currency] = {
          totalOrders: 0,
          totalAmount: 0,
          totalPayment: 0,
          totalBalance: 0,
        };
      }
      report.byCurrency[currency].totalOrders += 1;
      report.byCurrency[currency].totalAmount += total_amount;
      report.byCurrency[currency].totalPayment += payment;
      report.byCurrency[currency].totalBalance += payment - total_amount;
    });

    res.status(200).json({
      message: "Purchase report fetched successfully",
      data: purchases,
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch purchase report", error: error.message });
  }
};



// ===============================
// GET PROFIT AND LOSE
// ===============================

// const getProfitAndLoseReport = async (req, res) => {
//   try {
//     // Optional date range filters
//     const { start, end } = req.query;
//     const dateFilter = {};
//     if (start || end) {
//       dateFilter.created_at = {};
//       if (start) dateFilter.created_at.$gte = new Date(start);
//       if (end) dateFilter.created_at.$lte = new Date(end);
//     }

//     // Fetch SellOrders
//     const sellOrders = await SalesOrder.find({
//       ...dateFilter,
//       status: { $in: ["completed", "paid", "pending"] },
//     }).populate("customer_id"); // populate customer details if schema allows

//     // Fetch Expenses
//     const expenses = await Expense.find({
//       ...dateFilter,
//       status: { $in: ["paid", "pending"] },
//     });

//     // Totals (overall)
//     const totalSales = sellOrders.reduce(
//       (sum, order) => sum + (Number(order.payment) || 0),
//       0
//     );
//     const totalExpenses = expenses.reduce(
//       (sum, exp) => sum + (Number(exp.amount) || 0),
//       0
//     );
//     const overallProfit = totalSales - totalExpenses;
//     const overallLoss = overallProfit < 0 ? Math.abs(overallProfit) : 0;

//     // Group by currency
//     const reportByCurrency = {};

//     sellOrders.forEach(order => {
//       const cur = order.currency?.toLowerCase() || "usd";
//       if (!reportByCurrency[cur]) {
//         reportByCurrency[cur] = { sales: 0, expenses: 0, profit: 0, loss: 0 };
//       }
//       reportByCurrency[cur].sales += Number(order.payment) || 0;
//     });

//     expenses.forEach(exp => {
//       const cur = exp.currency?.toLowerCase() || "usd";
//       if (!reportByCurrency[cur]) {
//         reportByCurrency[cur] = { sales: 0, expenses: 0, profit: 0, loss: 0 };
//       }
//       reportByCurrency[cur].expenses += Number(exp.amount) || 0;
//     });

//     Object.keys(reportByCurrency).forEach(cur => {
//       const sales = reportByCurrency[cur].sales;
//       const expensesTotal = reportByCurrency[cur].expenses;
//       const profit = sales - expensesTotal;
//       reportByCurrency[cur].profit = profit;
//       reportByCurrency[cur].loss = profit < 0 ? Math.abs(profit) : 0;
//     });

//     const report = {
//       totals: {
//         sales: totalSales,
//         expenses: totalExpenses,
//         profit: overallProfit,
//         loss: overallLoss,
//       },
//       byCurrency: reportByCurrency,
//     };

//     // Collect customer list from sellOrders
//     const customers = sellOrders.map(order => order.customer_id);

//     res.status(200).json({
//       message: "Profit and loss report generated successfully",
//       data: {
//         report,
//         sellOrders,
//         expenses,
//         customers, // new field with customer list
//       },
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to generate profit/loss report",
//       error: error.message,
//     });
//   }
// };



const getProfitAndLoseReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const dateFilter = {};

    if (start || end) {
      dateFilter.created_at = {};
      if (start) dateFilter.created_at.$gte = new Date(start);
      if (end) dateFilter.created_at.$lte = new Date(end);
    }

    const sellOrders = await SalesOrder.find({
      ...dateFilter,
      status: { $in: ["completed", "paid", "pending"] },
    }).populate("customer_id");

    const expenses = await Expense.find({
      ...dateFilter,
      status: { $in: ["paid", "pending"] },
    });

    const totalSales = sellOrders.reduce(
      (sum, order) => sum + (Number(order.payment) || 0),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (Number(exp.amount) || 0),
      0
    );
    const overallProfit = totalSales - totalExpenses;
    const overallLoss = overallProfit < 0 ? Math.abs(overallProfit) : 0;

    const reportByCurrency = {};

    sellOrders.forEach(order => {
      const cur = order.currency?.toLowerCase() || "usd";
      if (!reportByCurrency[cur]) {
        reportByCurrency[cur] = { sales: 0, expenses: 0, profit: 0, loss: 0 };
      }
      reportByCurrency[cur].sales += Number(order.payment) || 0;
    });

    expenses.forEach(exp => {
      const cur = exp.currency?.toLowerCase() || "usd";
      if (!reportByCurrency[cur]) {
        reportByCurrency[cur] = { sales: 0, expenses: 0, profit: 0, loss: 0 };
      }
      reportByCurrency[cur].expenses += Number(exp.amount) || 0;
    });

    Object.keys(reportByCurrency).forEach(cur => {
      const sales = reportByCurrency[cur].sales;
      const expensesTotal = reportByCurrency[cur].expenses;
      const profit = sales - expensesTotal;
      reportByCurrency[cur].profit = profit;
      reportByCurrency[cur].loss = profit < 0 ? Math.abs(profit) : 0;
    });

    const report = {
      totals: {
        sales: totalSales,
        expenses: totalExpenses,
        profit: overallProfit,
        loss: overallLoss,
      },
      byCurrency: reportByCurrency,
    };

    const customers = sellOrders.map(order => order.customer_id);

    res.status(200).json({
      message: "Profit and loss report generated successfully",
      data: {
        report,
        sellOrders,
        expenses,
        customers,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate profit/loss report",
      error: error.message,
    });
  }
};

// ===============================
// GET TOP SELLING PRODUCTS
// ===============================

const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const topProducts = await SalesOrder.aggregate([
      { $unwind: "$items" },
      { 
        $group: {
          _id: "$items.product_id",
          totalSold: { $sum: "$items.qty" },
          lastSoldAt: { $max: "$created_at" }
        } 
      },
      { $sort: { totalSold: -1 } },
      { 
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        } 
      },
      { $unwind: "$product" },
      { $match: { "product.is_manage_stock": true } },

      // lookup category
      { 
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category"
        } 
      },
      { 
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true } 
      },

      { $limit: limit },

      { 
        $project: {
          _id: 0,
          product_id: "$product._id",
          name: "$product.name",
          price: "$product.price",
          image: "$product.image_url",
          unit: "$product.unit",
          totalSold: 1,
          created_at: "$lastSoldAt",
          category: {
            id: "$category._id",
            name: "$category.name"
          }
        } 
      }
    ]);

    res.status(200).json(topProducts);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch top selling products",
      error: error.message
    });
  }
};


export {
  getProductsBelowAlertStock,
  getAllSalesOrders,
  getPurchaseReport,
  getProfitAndLoseReport,
  getTopSellingProducts
}