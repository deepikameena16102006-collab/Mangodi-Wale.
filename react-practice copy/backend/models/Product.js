
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["250g", "500g", "1kg"],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "Traditional Snacks",
    },

    image: {
      type: String,
      default: "",
    },

    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (variants) => variants.length > 0,
        message: "At least one product size is required.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;
