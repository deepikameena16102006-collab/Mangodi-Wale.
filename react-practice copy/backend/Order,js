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

  items: Array,

  total: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;