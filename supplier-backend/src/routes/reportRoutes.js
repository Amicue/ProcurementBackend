const express = require("express");
const router = express.Router();
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");

// Supplier performance (orders count & total amount)
router.get("/supplier-performance", async (req, res) => {
  try {
    const data = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$supplier",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: "$supplier" },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Spending analytics (monthly trend)
router.get("/spending-trends", async (req, res) => {
  try {
    const data = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Procurement cycle timelines (avg duration)
router.get("/cycle-time", async (req, res) => {
  try {
    const data = await PurchaseOrder.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $project: {
          cycleDays: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgCycleTime: { $avg: "$cycleDays" },
        },
      },
    ]);

    res.json(data[0] || { avgCycleTime: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
