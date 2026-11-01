import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Order from "./Order.js";
dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((error) => console.error("MongoDB Connection Error:", error));
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: "",
  },
  subject: {
    type: String,
    required: true,
    enum: [
      "Product enquiry",
      "Existing order support",
      "Bulk / business enquiry",
      "Other question",
    ],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ["New", "Read", "Replied"],
    default: "New",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);

app.get("/", (req, res) => {
  res.send("Mangodi Wale Backend is Running!");
});



app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone = "", subject, message } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      phone.length > 20 ||
      message.trim().length < 10 ||
      message.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check the contact form details and try again.",
      });
    }

    const allowedSubjects = [
      "Product enquiry",
      "Existing order support",
      "Bulk / business enquiry",
      "Other question",
    ];

    if (!allowedSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid enquiry type.",
      });
    }

    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Contact enquiry saved successfully.",
      enquiryId: savedMessage._id,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      success: false,
      message: "Message could not be saved. Please try again later.",
    });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    if (!req.body.orderId || !req.body.customer || !req.body.items || !req.body.total) {
  return res.status(400).json({
    success: false,
    message: "Invalid order data",
  });
}
    const order = new Order(req.body);

    const savedOrder = await order.save();

    res.json({
      success: true,
      message: "Order saved to MongoDB successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("MongoDB Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Order could not be saved.",
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});