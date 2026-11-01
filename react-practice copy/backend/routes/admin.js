
import express from "express";
import mongoose from "mongoose";
import Order from "../Order.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(requireAdmin);

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not load orders.",
    });
  }
});

// Update order and payment status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body || {};

    const allowedOrderStatuses = [
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const allowedPaymentStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    const updates = {};

    if (orderStatus !== undefined) {
      if (!allowedOrderStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      updates.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status.",
        });
      }

      updates.paymentStatus = paymentStatus;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Choose a status to update.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.json({
      success: true,
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    console.error("Admin update error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not update order.",
    });
  }
});

export default router;
