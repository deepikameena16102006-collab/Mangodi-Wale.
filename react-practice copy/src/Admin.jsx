
import { useEffect, useMemo, useState } from "react";
import "./Admin.css";
import ManageProducts from "./ManageProducts.jsx";
const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("Loading orders...");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [updating, setUpdating] = useState("");

  const token = sessionStorage.getItem("mangodiToken");

  useEffect(() => {
    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    fetch("http://localhost:5000/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load orders.");
        }
        return data;
      })
      .then((data) => {
        setOrders(data.orders || []);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [token]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const pendingCount = orders.filter(
    (order) => (order.orderStatus || "Placed") === "Placed"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = [
        order.orderId,
        order.customer?.name,
        order.customer?.mobile,
        order.customer?.city,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      const status = order.orderStatus || "Placed";
      const matchesFilter = filter === "All" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  async function updateOrder(id, field, value) {
    const key = `${id}-${field}`;
    setUpdating(key);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setOrders((previous) =>
        previous.map((order) =>
          order._id === id ? { ...order, ...data.order } : order
        )
      );
      setMessage("Changes saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUpdating("");
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="admin-eyebrow">MANGODI WALE · MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Manage orders, customers and payments in one place.</p>
        </div>
        <div className="admin-hero-mark">MW</div>
      </section>

      <section className="admin-stats">
        <article className="admin-stat">
          <span className="stat-icon">📦</span>
          <p>Total Orders</p>
          <h2>{orders.length}</h2>
          <small>All recorded orders</small>
        </article>

        <article className="admin-stat">
          <span className="stat-icon">🕒</span>
          <p>New / Placed</p>
          <h2>{pendingCount}</h2>
          <small>Awaiting processing</small>
        </article>

        <article className="admin-stat">
          <span className="stat-icon">✓</span>
          <p>Delivered</p>
          <h2>{deliveredCount}</h2>
          <small>Successfully delivered</small>
        </article>

        <article className="admin-stat revenue-stat">
          <span className="stat-icon">₹</span>
          <p>Order Value</p>
          <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
          <small>Total value of recorded orders</small>
        </article>
      </section>
              <div className="admin-tabs">
  <button
    type="button"
    className={activeTab === "orders" ? "active" : ""}
    onClick={() => setActiveTab("orders")}
  >
    Customer Orders
  </button>

  <button
    type="button"
    className={activeTab === "products" ? "active" : ""}
    onClick={() => setActiveTab("products")}
  >
    Manage Products
  </button>
</div>
     {activeTab === "orders" && (
  <section className="admin-orders-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">ORDER MANAGEMENT</span>
            <h2>Customer Orders</h2>
            <p>Review each order and update its status.</p>
          </div>
          <span className="admin-order-count">
            {filteredOrders.length} orders
          </span>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Search order, customer, mobile or city..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search orders"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {message && (
          <p className="admin-message" role="status">{message}</p>
        )}

        {!message && filteredOrders.length === 0 && (
          <div className="admin-empty">
            <span>📋</span>
            <h3>No orders found</h3>
            <p>Try another search or status filter.</p>
          </div>
        )}

        <div className="admin-order-list">
          {filteredOrders.map((order) => (
            <article className="admin-order-card" key={order._id}>
              <div className="order-card-top">
                <div>
                  <span className="order-label">ORDER ID</span>
                  <h3>{order.orderId || order._id}</h3>
                </div>
                <span className={`order-badge ${(order.orderStatus || "Placed").toLowerCase()}`}>
                  {order.orderStatus || "Placed"}
                </span>
              </div>

              <div className="order-card-details">
                <div>
                  <span className="order-label">CUSTOMER</span>
                  <strong>{order.customer?.name || "N/A"}</strong>
                </div>
                <div>
                  <span className="order-label">MOBILE</span>
                  <strong>{order.customer?.mobile || "N/A"}</strong>
                </div>
                <div>
                  <span className="order-label">ORDER TOTAL</span>
                  <strong className="order-total">
                    ₹{(Number(order.total) || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <span className="order-label">PAYMENT METHOD</span>
                  <strong>{order.paymentMethod || "N/A"}</strong>
                </div>
              </div>

              <div className="order-address">
                <span className="order-label">DELIVERY ADDRESS</span>
                <p>
                  {[
                    order.customer?.address,
                    order.customer?.city,
                    order.customer?.state,
                    order.customer?.pincode,
                  ].filter(Boolean).join(", ") || "Address not available"}
                </p>
              </div>

              <div className="order-card-bottom">
                <label>
                  <span>Order Status</span>
                  <select
                    value={order.orderStatus || "Placed"}
                    disabled={updating === `${order._id}-orderStatus`}
                    onChange={(event) =>
                      updateOrder(order._id, "orderStatus", event.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Payment Status</span>
                  <select
                    value={order.paymentStatus || "Pending"}
                    disabled={updating === `${order._id}-paymentStatus`}
                    onChange={(event) =>
                      updateOrder(order._id, "paymentStatus", event.target.value)
                    }
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
        </section>
)}
{activeTab === "products" && <ManageProducts />}
    </main>
  );
}
