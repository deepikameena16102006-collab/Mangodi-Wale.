
import express from "express";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public: Get active products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load products.",
    });
  }
});

// Admin: Add product
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, description, category, image, variants } = req.body;

    if (
      !name?.trim() ||
      !Array.isArray(variants) ||
      variants.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name and at least one variant are required.",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      image,
      variants,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Could not add product.",
    });
  }
});

// Admin: Update product
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Could not update product.",
    });
  }
});

// Admin: Delete product
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not delete product.",
    });
  }
});

export default router;
