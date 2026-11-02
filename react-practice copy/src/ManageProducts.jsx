import { useEffect, useState } from "react";
import "./ManageProducts.css";

const API_URL = "https://mangodi-wale-api.onrender.com/api/products";

const SIZES = ["250g", "500g", "1kg"];

const emptyVariants = () =>
  SIZES.map((size) => ({
    size,
    price: "",
    stock: "",
  }));

const emptyProduct = () => ({
  name: "",
  description: "",
  category: "Traditional Snacks",
  image: "",
  variants: emptyVariants(),
});

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = sessionStorage.getItem("mangodiToken");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load products.");
      }

      // Supports either { success: true, products: [...] } or [...]
      const productList = Array.isArray(data) ? data : data.products || [];

      setProducts(productList);
    } catch (error) {
      setMessage(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update product text fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update price or stock for a specific packet size
  const handleVariantChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      ),
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm(emptyProduct());
    setEditingId(null);
  };

  // Load existing product into the form
  const handleEdit = (product) => {
    setEditingId(product._id || product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Traditional Snacks",
      image: product.image || "",
      variants: SIZES.map((size) => {
        const existingVariant = product.variants?.find(
          (variant) => variant.size === size
        );

        return {
          size,
          price: existingVariant?.price ?? "",
          stock: existingVariant?.stock ?? "",
        };
      }),
    });

    setMessage("");
    document.querySelector(".manage-products")?.scrollIntoView({
  behavior: "smooth",
  block: "start",
});
  };

  // Add or update a product
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.name.trim()) {
      setMessage("Please enter the product name.");
      return;
    }

    const cleanedVariants = form.variants.map((variant) => ({
      size: variant.size,
      price: Number(variant.price),
      stock: Number(variant.stock),
    }));

    const hasInvalidVariant = cleanedVariants.some(
      (variant) =>
        variant.price < 0 ||
        variant.stock < 0 ||
        variant.price === "" ||
        variant.stock === "" ||
        !Number.isFinite(variant.price) ||
        !Number.isFinite(variant.stock)
    );

    if (hasInvalidVariant) {
      setMessage("Please enter a valid price and stock for every size.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      image: form.image.trim(),
      variants: cleanedVariants,
    };

    try {
      setSaving(true);

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save product.");
      }

      setMessage(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      resetForm();
      await fetchProducts();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a product
  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product.");
      }

      setMessage("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      setMessage(error.message || "Could not delete product.");
    }
  };

  // Inventory statistics
  const totalStock = products.reduce(
    (total, product) =>
      total +
      (product.variants || []).reduce(
        (variantTotal, variant) => variantTotal + Number(variant.stock || 0),
        0
      ),
    0
  );

  const lowStockCount = products.reduce(
    (total, product) =>
      total +
      (product.variants || []).filter(
        (variant) => Number(variant.stock) > 0 && Number(variant.stock) <= 5
      ).length,
    0
  );

  const outOfStockCount = products.reduce(
    (total, product) =>
      total +
      (product.variants || []).filter(
        (variant) => Number(variant.stock) === 0
      ).length,
    0
  );

  return (
    <div className="manage-products">
      <div className="manage-products-heading">
        <div>
          <p className="mp-eyebrow">INVENTORY CONTROL</p>
          <h2>Manage Products</h2>
          <p className="mp-subtitle">
            Add products, update packet prices, and manage stock.
          </p>
        </div>
      </div>

      {/* Inventory summary */}
      <div className="mp-stats">
        <div className="mp-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>

        <div className="mp-stat-card">
          <span>Total Packets in Stock</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="mp-stat-card mp-low-stock">
          <span>Low Stock Variants</span>
          <strong>{lowStockCount}</strong>
        </div>

        <div className="mp-stat-card mp-out-stock">
          <span>Out of Stock Variants</span>
          <strong>{outOfStockCount}</strong>
        </div>
      </div>

      {/* Add / Edit product form */}
      <section className="mp-form-card">
        <div className="mp-section-heading">
          <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
          {editingId && (
            <button
              type="button"
              className="mp-cancel-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mp-form-grid">
            <label>
              Product Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mangodi"
                required
              />
            </label>

            <label>
              Category
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Traditional Snacks"
              />
            </label>

            <label className="mp-full-width">
              Product Image URL
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Paste product image URL"
              />
            </label>

            <label className="mp-full-width">
              Product Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a short product description..."
                rows="3"
              />
            </label>
          </div>

          <div className="mp-variant-heading">
            <h4>Packet Price & Stock</h4>
            <p>Enter separate prices and stock for each packet size.</p>
          </div>

          <div className="mp-variant-list">
            {form.variants.map((variant, index) => (
              <div className="mp-variant-row" key={variant.size}>
                <div className="mp-size-label">{variant.size}</div>

                <label>
                  Price (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(event) =>
                      handleVariantChange(index, "price", event.target.value)
                    }
                    placeholder="Price"
                    required
                  />
                </label>

                <label>
                  Stock (packets)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(event) =>
                      handleVariantChange(index, "stock", event.target.value)
                    }
                    placeholder="Stock"
                    required
                  />
                </label>
              </div>
            ))}
          </div>

          {message && <p className="mp-message">{message}</p>}

          <button className="mp-save-button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
              ? "Update Product"
              : "Add Product"}
          </button>
        </form>
      </section>

      {/* Product list */}
      <section className="mp-product-section">
        <div className="mp-section-heading">
          <h3>All Products</h3>
          <span>{products.length} products</span>
        </div>

        {loading ? (
          <p className="mp-empty-message">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="mp-empty-message">
            No products found. Add your first product above.
          </p>
        ) : (
          <div className="mp-product-grid">
            {products.map((product) => {
              const productId = product._id || product.id;

              return (
                <article className="mp-product-card" key={productId}>
                  {product.image ? (
                    <img
                      className="mp-product-image"
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="mp-no-image">No Image</div>
                  )}

                  <div className="mp-product-content">
                    <div className="mp-product-title-row">
                      <h4>{product.name}</h4>
                      <span className="mp-category">
                        {product.category || "Traditional Snacks"}
                      </span>
                    </div>

                    <p className="mp-product-description">
                      {product.description || "No description added."}
                    </p>

                    <div className="mp-inventory-table">
                      {(product.variants || []).map((variant) => (
                        <div
                          className="mp-inventory-row"
                          key={variant.size}
                        >
                          <span>{variant.size}</span>
                          <span>₹{variant.price}</span>
                          <span
                            className={
                              Number(variant.stock) === 0
                                ? "mp-stock-zero"
                                : Number(variant.stock) <= 5
                                ? "mp-stock-low"
                                : "mp-stock-good"
                            }
                          >
                            {variant.stock} in stock
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mp-product-actions">
                   <button
                    type="button"
                  onClick={() => handleEdit(product)}
                      >
                   Edit
                  </button>

                      <button
                        type="button"
                        className="mp-delete-button"
                        onClick={() => handleDelete(productId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageProducts;