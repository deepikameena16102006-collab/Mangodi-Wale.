
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: String,

  customer: {
    name: String,
    mobile: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },

  paymentMethod: String,

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },

  orderStatus: {
    type: String,
    enum: [
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Placed",
  },

  items: Array,
  total: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
