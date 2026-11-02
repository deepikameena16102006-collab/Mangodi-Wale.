import Admin from "./Admin.jsx";
import Login from "./Login.jsx";
import { useEffect, useMemo, useState } from "react";
import "./style.css";
/* =========================================================
   PRODUCT DATA
   ========================================================= */

const products = [
  {
    id: 1,
    name: "Mangodi",
    image: "/images/mangodi.jpg",
    tag: "BESTSELLER",
    description: "Traditional Rajasthani taste.",
    prices: {
      "250g": 70,
      "500g": 130,
      "1kg": 240,
    },
  },

  {
    id: 2,
    name: "Banana Chips",
    image: "/images/chips.jpg",
    tag: "CRISPY FAVOURITE",
    description: "Light, crispy and crunchy.",
    prices: {
      "250g": 110,
      "500g": 210,
      "1kg": 390,
    },
  },

  {
    id: 3,
    name: "Namkeen",
    image: "/images/namkeen.jpg",
    tag: "TEA-TIME PICK",
    description: "Perfect tea-time snack.",
    prices: {
      "250g": 70,
      "500g": 130,
      "1kg": 240,
    },
  },
];


/* =========================================================
   CUSTOMER DETAILS
   ========================================================= */

const emptyCustomer = {
  name: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};


/* =========================================================
   MAIN APP
   ========================================================= */

function App() {

  const [page, setPage] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 40);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
const [heroSlide, setHeroSlide] = useState(0);


useEffect(() => {
  const delay = heroSlide === 3 ? 1800 : 99999;

  const slideTimer = window.setTimeout(() => {
    setHeroSlide((current) => (current === 3 ? 0 : current + 1));
  }, delay);

  return () => window.clearTimeout(slideTimer);
}, [heroSlide]);


const [apiProducts, setApiProducts] = useState([]);
const [loading, setLoading] = useState(true);
const displayProducts =

  apiProducts.length > 0
    ? apiProducts.map((product) => {
        const oldProduct = products.find(
          (item) => item.id === product.id
        );

        return {
          ...product,
          image: oldProduct?.image,
          tag: oldProduct?.tag,
        };
      })
    : products;

  const [cart, setCart] = useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedWeight, setSelectedWeight] =
    useState("250g");

  const [customerDetails, setCustomerDetails] =
    useState(emptyCustomer);

  const [paymentMethod, setPaymentMethod] =
    useState("Online Payment");

  const [orderId, setOrderId] =
    useState("");
    const [orderItems, setOrderItems] = useState([]);


  const [lastOrderTotal, setLastOrderTotal] =
    useState(0);
const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  /* =======================================================
     CART TOTAL
     ======================================================= */

  const cartTotal = useMemo(() => {

    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

  }, [cart]);


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const goHome = () => {

    setPage("home");

    setSelectedProduct(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const goProducts = () => {

    setPage("products");

    setSelectedProduct(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const goTo = (nextPage) => {

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =======================================================
     OPEN PRODUCT
     ======================================================= */

  const openProduct = (product) => {

    setSelectedProduct(product);

    setSelectedWeight("250g");

    setPage("detail");

    window.scrollTo({
      top: 0,
      
      behavior: "smooth",
    });
  };


  /* =======================================================
     ADD TO CART
     ======================================================= */

  const addToCart = () => {

    if (!selectedProduct) return;

    const price =
      selectedProduct.prices[selectedWeight];

    const item = {
      id: Date.now(),
      name: selectedProduct.name,
      image: selectedProduct.image,
      weight: selectedWeight,
      price: price,
      quantity: 1,
    };

    setCart((currentCart) => [
      ...currentCart,
      item,
    ]);

    setPage("cart");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =======================================================
     UPDATE QUANTITY
     ======================================================= */

  const updateQuantity = (id, change) => {

    setCart((currentCart) =>

      currentCart.map((item) => {

        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            item.quantity + change
          ),
        };

      })
    );
  };


  /* =======================================================
     REMOVE ITEM
     ======================================================= */

  const removeItem = (id) => {

    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };


  /* =======================================================
     PLACE ORDER
     ======================================================= */

const placeOrder = async () => {
  const allDetailsFilled = Object.values(customerDetails).every(
    (value) => String(value).trim() !== ""
  );

  if (!allDetailsFilled) {
    alert("Please fill all customer details.");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    setPage("products");
    scrollTop();
    return;
  }

  const newOrderId = "MW-" + Date.now();
  const itemsForOrder = [...cart];

  const orderData = {
    orderId: newOrderId,
    customer: customerDetails,
    paymentMethod,
    items: itemsForOrder,
    total: cartTotal,
  };

  try {
    const response = await fetch(
      "https://mangodi-wale-api.onrender.com/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    const data = await response.json();

    console.log("Backend status:", response.status);
    console.log("Backend response:", data);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Order could not be saved");
    }

    setOrderId(data.orderId || newOrderId);
    setOrderItems(itemsForOrder);
    setLastOrderTotal(cartTotal);
    setCart([]);
    setPage("confirm");
  } catch (error) {
    console.error("Order Backend Error:", error);
    alert("Order could not be saved. Please try again.");
  }
};

  /* =======================================================
     NAVBAR
     ======================================================= */

  const Navbar = () => {

    return (
<nav className="navbar">
      {/* BRAND / LOGO */}

        <button
          className="brand"
          onClick={goHome}
          aria-label="Mangodi Wale Home"
        >

          <div className="brand-logo-wrap">

            <img
              src="/images/logo.png"
              alt="Mangodi Wale Logo"
            />

            {/* HOVER POPUP */}

            <span className="logo-hover-popup">
              MANGODI WALE
              <small>
                Ghar Ka Swaad
              </small>
            </span>

          </div>
          


<div className="brand-copy">
  <span className="brand-name">MANGODI WALE</span>
  <small className="brand-subtitle">GHAR KA SWAAD</small>
</div>

        </button>


        {/* NAV LINKS */}

        <div className="nav-links">

          <button
            className={
              page === "home"
                ? "active"
                : ""
            }
            onClick={goHome}
          >
            Home
          </button>


          <button
            className={
              page === "products"
                ? "active"
                : ""
            }
            onClick={goProducts}
          >
            Products
          </button>


          <button
            className={
              page === "about"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("about")
            }
          >
            About
          </button>


          <button
            className={
              page === "contact"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("contact")
            }
          >
            Contact
          </button>

        </div>
       
{/* NAV ACTIONS */}

<div className="nav-actions">

 <button
    className="cart-link"
    onClick={() => goTo("cart")}
  >
    🛒 Cart ({cart.length})
  </button> 

  <button
    className="order-now"
    onClick={goProducts}
  >
    Order Now →
  </button>

</div>


      </nav>
    );
  };


  /* =======================================================
     FOOTER
     ======================================================= */

  const Footer = () => {

    return (

      <footer>

        <div className="footer-main">

          <div className="footer-brand">

            <img
              src="/images/logo.png"
              alt="Mangodi Wale"
            />

            <div>

              <strong>
                MANGODI WALE
              </strong>

              <span>
                Ghar ka swaad, seedha aapke ghar.
              </span>

            </div>

          </div>


          <div className="footer-links">

            <button onClick={goHome}>
              Home
            </button>

            <button onClick={goProducts}>
              Products
            </button>

            <button
              onClick={() =>
                goTo("about")
              }
            >
              About
            </button>

            <button
              onClick={() =>
                goTo("contact")
              }
            >
              Contact
            </button>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 Mangodi Wale
          </span>

          <span>
            Traditional • Fresh • Desi
          </span>

        </div>
<div className="footer-account-links">
   <span className="footer-leaf" aria-hidden="true">❧</span>
  <button onClick={() => setPage("login")}>
    My Account
  </button>

  <button onClick={() => setPage("admin")}>
    Admin Dashboard
  </button>
   <span className="footer-leaf footer-leaf-right" aria-hidden="true">
    ❧
  </span>
</div>
      </footer>
    );
  };


  /* =======================================================
     HOME PAGE
     ======================================================= */

  const HomePage = () => {

    return (

      <>

        {/* =================================================
            HERO
            ================================================= */}

        <section className="hero">


          {/* LEFT CONTENT */}

          <div className="hero-copy">

            <div className="hero-kicker">

              <span>❧</span>

              TRADITIONAL

              <i>•</i>

              FRESH

              <i>•</i>

              DESI

            </div>


            <h1>

              Ghar ka swaad,

              <span>
                seedha aapke ghar.
              </span>

            </h1>


            <p className="hero-description">

              Rajasthani-inspired snacks
              made with traditional taste,
              authentic recipes and lots
              of love.

            </p>


            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={goProducts}
              >

                Explore Products

                <span>
                  →
                </span>

              </button>


              <button
                className="gold-btn"
                onClick={() =>
                  goTo("about")
                }
              >

                Our Story

                <span>
                  ✦
                </span>

              </button>

            </div>


            {/* HERO FEATURES */}

            <div className="hero-features">

              <div className="hero-feature">

                <div className="feature-icon">
                  ❧
                </div>

                <div>

                  <strong>
                    Traditional
                  </strong>

                  <span>
                    Taste
                  </span>

                </div>

              </div>


              <div className="feature-line"></div>


              <div className="hero-feature">

                <div className="feature-icon">
                  ♧
                </div>

                <div>

                  <strong>
                    Fresh
                  </strong>

                  <span>
                    Products
                  </span>

                </div>

              </div>


              <div className="feature-line"></div>


              <div className="hero-feature">

                <div className="feature-icon">
                  ◈
                </div>

                <div>

                  <strong>
                    Easy
                  </strong>

                  <span>
                    Ordering
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE — MANGODI MAKING VIDEO
              ================================================= */}
          
   
<div className="hero-visual">
  <div className="hero-reel" aria-label="Mangodi Wale product showcase">
    <div className="hero-reel-track">

      <div className="hero-reel-frame">
        <img src="/images/mangodi.jpg" alt="Traditional Mangodi" />
        <div className="hero-reel-label">
          <span>THE RAJASTHANI CLASSIC</span>
          <strong>MANGODI</strong>
        </div>
      </div>

      <div className="hero-reel-frame">
        <img src="/images/chips.jpg" alt="Golden Banana Chips" />
        <div className="hero-reel-label">
          <span>GOLDEN &amp; CRISPY</span>
          <strong>BANANA CHIPS</strong>
        </div>
      </div>

      <div className="hero-reel-frame">
        <img src="/images/namkeen.jpg" alt="Traditional Namkeen" />
        <div className="hero-reel-label">
          <span>THE DESI FAVOURITE</span>
          <strong>NAMKEEN</strong>
        </div>
      </div>

      <div className="hero-reel-frame" aria-hidden="true">
        <img src="/images/mangodi.jpg" alt="" />
        <div className="hero-reel-label">
          <span>THE RAJASTHANI CLASSIC</span>
          <strong>MANGODI</strong>
        </div>
      </div>

      <div className="hero-reel-frame" aria-hidden="true">
        <img src="/images/chips.jpg" alt="" />
        <div className="hero-reel-label">
          <span>GOLDEN &amp; CRISPY</span>
          <strong>BANANA CHIPS</strong>
        </div>
      </div>

      <div className="hero-reel-frame" aria-hidden="true">
        <img src="/images/namkeen.jpg" alt="" />
        <div className="hero-reel-label">
          <span>THE DESI FAVOURITE</span>
          <strong>NAMKEEN</strong>
        </div>
      </div>

    </div>
  </div>

  <div className="hero-reel-shade"></div>

  <div className="falling-food-stage" aria-hidden="true">
    <div className="falling-food falling-food-1">
      <img src="/images/mangodi.jpg" alt="" />
    </div>
    <div className="falling-food falling-food-2">
      <img src="/images/chips.jpg" alt="" />
    </div>
    <div className="falling-food falling-food-3">
      <img src="/images/namkeen.jpg" alt="" />
    </div>
    <div className="falling-food falling-food-4">
      <img src="/images/chips.jpg" alt="" />
    </div>
    <div className="falling-food falling-food-5">
      <img src="/images/mangodi.jpg" alt="" />
    </div>
    <div className="falling-food falling-food-6">
      <img src="/images/namkeen.jpg" alt="" />
    </div>
  </div>

  <div className="hero-sparkles" aria-hidden="true">
    <span className="sparkle sparkle-1">✦</span>
    <span className="sparkle sparkle-2">✧</span>
    <span className="sparkle sparkle-3">✦</span>
    <span className="sparkle sparkle-4">✧</span>
    <span className="sparkle sparkle-5">✦</span>
    <span className="sparkle sparkle-6">✧</span>
    <span className="sparkle sparkle-7">✦</span>
  </div>

  <div className="hero-script">
    Rajasthani
    <span>Parampara ♡</span>
  </div>

  <div className="homemade-badge">
    <span>❧</span>
    <strong>100%</strong>
    <small>HOMEMADE</small>
  </div>

  <div className="hero-scene-caption">
    <span>❧</span>
    <p>Crafted for your cravings</p>
  </div>
</div>



        </section>


        {/* =================================================
            PRODUCTS
            ================================================= */}

        <section className="products-preview">

          <div className="section-heading">

            <span>
              ❧
            </span>

            <div>

              <small>
                FROM OUR KITCHEN
              </small>

              <h2>
                Our Products
              </h2>

            </div>

            <span>
              ❧
            </span>

          </div>

<ProductCards products={displayProducts} onOpen={openProduct} />

          <div className="view-all-wrap">

            <button
              className="outline-btn"
              onClick={goProducts}
            >
              View All Products →
            </button>

          </div>

        </section>


        {/* =================================================
            WHY CHOOSE
            ================================================= */}

        <section className="why-section">

          <div className="section-heading light">

            <span>
              ❧
            </span>

            <div>

              <small>
                THE MANGODI WALE PROMISE
              </small>

              <h2>
                Made the traditional way.
              </h2>

            </div>

            <span>
              ❧
            </span>

          </div>


          <div className="why-grid">

            <div className="why-card">

              <div className="why-icon">
                🌿
              </div>

              <h3>
                Quality Products
              </h3>

              <p>
                Made with care and
                attention to every batch.
              </p>

            </div>


            <div className="why-card">

              <div className="why-icon">
                🏠
              </div>

              <h3>
                Ghar Jaisa Taste
              </h3>

              <p>
                Traditional flavours
                that feel familiar.
              </p>

            </div>


            <div className="why-card">

              <div className="why-icon">
                📦
              </div>

              <h3>
                Flexible Packs
              </h3>

              <p>
                Choose the pack size
                that suits you.
              </p>

            </div>


            <div className="why-card">

              <div className="why-icon">
                🚚
              </div>

              <h3>
                Easy Ordering
              </h3>

              <p>
                Simple ordering from
                your home.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            STATS
            ================================================= */}

        <section className="stats-section">

          <div className="stat">

            <strong>
              03
            </strong>

            <span>
              Signature Products
            </span>

          </div>


          <div className="stat">

            <strong>
              250g+
            </strong>

            <span>
              Flexible Packs
            </span>

          </div>


          <div className="stat">

            <strong>
              100%
            </strong>

            <span>
              Easy Ordering
            </span>

          </div>

        </section>

      </>
    );
  };


  /* =======================================================
     PRODUCTS PAGE
     ======================================================= */

  const ProductsPage = () => {

    return (

      <main className="inner-page">

        <div className="page-title">

          <span>
            TRADITIONAL • FRESH • DESI
          </span>

          <h1>
            Our Products
          </h1>

          <p>
            Choose your favourite
            ghar ka swaad.
          </p>

        </div>


        <ProductCards
          products={products}
          onOpen={openProduct}
        />

      </main>
    );
  };


  /* =======================================================
     PRODUCT DETAIL
     ======================================================= */

  const ProductDetailPage = () => {

    if (!selectedProduct) {
      return null;
    }


    return (

      <main className="inner-page">

        <button
          className="back-btn"
          onClick={goProducts}
        >
          ← Back to Products
        </button>


        <section className="detail-page">

          <div className="detail-image">

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

          </div>


          <div className="detail-info">

            <span className="mini-tag">
              {selectedProduct.tag}
            </span>


            <h1>
              {selectedProduct.name}
            </h1>


            <p>
              {selectedProduct.description}
            </p>


            <h3>
              Choose Pack Size
            </h3>


            <div className="weights">

              {[
                "250g",
                "500g",
                "1kg",
              ].map((weight) => (

                <button
                  key={weight}
                  className={
                    selectedWeight === weight
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedWeight(
                      weight
                    )
                  }
                >

                  <strong>
                    {weight}
                  </strong>

                  <small>
                    ₹
                    {
                      selectedProduct
                        .prices[weight]
                    }
                  </small>

                </button>

              ))}

            </div>


            <div className="detail-price">

              ₹
              {
                selectedProduct
                  .prices[selectedWeight]
              }

            </div>


            <div className="detail-actions">

              <button
                className="primary-btn large"
                onClick={addToCart}
              >
                Add to Cart →
              </button>


              <button
                className="text-btn"
                onClick={() =>
                  goTo("cart")
                }
              >
                View Cart
              </button>

            </div>

          </div>

        </section>

      </main>
    );
  };


  /* =======================================================
     CART PAGE
     ======================================================= */

  const CartPage = () => {

    return (

      <main className="inner-page">

        <div className="page-title">

          <span>
            YOUR SELECTION
          </span>

          <h1>
            Your Cart
          </h1>

        </div>


        {cart.length === 0 ? (

          <div className="empty-box">

            <div className="empty-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Add some Mangodi Wale
              favourites to continue.
            </p>

            <button
              className="primary-btn"
              onClick={goProducts}
            >
              Explore Products →
            </button>

          </div>

        ) : (

          <section className="cart-layout">

            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />


                  <div className="cart-item-info">

                    <span>
                      {item.weight}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ₹{item.price}
                    </p>


                    <div className="quantity">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            -1
                          )
                        }
                      >
                        −
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            1
                          )
                        }
                      >
                        +
                      </button>

                    </div>
 </div>


                  <div className="cart-item-right">

                    <strong>
                      ₹
                      {
                        item.price *
                        item.quantity
                      }
                    </strong>


                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>


            <aside className="summary-card">

              <span>
                ORDER SUMMARY
              </span>

              <h2>
                ₹{cartTotal}
              </h2>

              <p>
                Delivery details will
                be collected at checkout.
              </p>


              <button
                className="primary-btn full"
                onClick={() =>
                  goTo("checkout")
                }
              >
                Proceed to Checkout →
              </button>


              <button
                className="text-btn"
                onClick={goProducts}
              >
                Continue Shopping
              </button>

            </aside>

          </section>

        )}

      </main>
    );
  };


  /* =======================================================
     CHECKOUT PAGE
     ======================================================= */

  const renderCheckoutPage = () => {

    return (

      <main className="inner-page">

        <div className="page-title">

          <span>
            ALMOST THERE
          </span>

          <h1>
            Checkout
          </h1>

          <p>
            Enter your delivery details.
          </p>

        </div>


        <section className="checkout-layout">

          <div className="checkout-form">

            <h2>
              Customer Details
            </h2>


            <div className="form-grid">

              <input
                type="text"
                placeholder="Full Name"
                value={
                  customerDetails.name
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    name:
                      e.target.value,
                  })
                }
              />


              <input
                type="tel"
                placeholder="Mobile Number"
                 maxLength={10}
                value={
                  customerDetails.mobile
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    mobile:
                      e.target.value,
                  })
                }
              />


              <input
                className="wide"
                type="text"
                placeholder="House / Street Address"
                value={
                  customerDetails.address
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    address:
                      e.target.value,
                  })
                }
              />


              <input
                type="text"
                placeholder="City"
                value={
                  customerDetails.city
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    city:
                      e.target.value,
                  })
                }
              />


              <input
                type="text"
                placeholder="State"
                value={
                  customerDetails.state
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    state:
                      e.target.value,
                  })
                }
              />


              <input
                type="tel"
                placeholder="Pincode"
                maxLength={6}
                value={
                  customerDetails.pincode
                }
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    pincode:
                      e.target.value,
                  })
                }
              />

            </div>


            <h2>
              Payment Method
            </h2>


            <label className="payment-option">

              <input
                type="radio"
                checked={
                  paymentMethod ===
                  "Online Payment"
                }
                onChange={() =>
                  setPaymentMethod(
                    "Online Payment"
                  )
                }
              />

              Online Payment

            </label>


            <label className="payment-option">

              <input
                type="radio"
                checked={
                  paymentMethod ===
                  "Cash on Delivery"
                }
                onChange={() =>
                  setPaymentMethod(
                    "Cash on Delivery"
                  )
                }
              />

              Cash on Delivery

            </label>

          </div>


          <aside className="summary-card">

            <span>
              TOTAL AMOUNT
            </span>

            <h2>
              ₹{cartTotal}
            </h2>


            <div className="checkout-list">

              {cart.map((item) => (

                <p key={item.id}>

                  {item.name}

                  {" — "}

                  {item.weight}

                  {" × "}

                  {item.quantity}

                </p>

              ))}

            </div>


            <button
              className="primary-btn full"
              onClick={placeOrder}
            >
              Place Order →
            </button>

          </aside>

        </section>

      </main>
    );
  };


  /* =======================================================
     CONFIRMATION PAGE
     ======================================================= */

  const ConfirmationPage = () => {

    return (

      <main className="inner-page">

        <section className="success-page">

          <div className="success-mark">
            ✓
          </div>


          <span>
            Thank you for ordering
            from Mangodi Wale.
          </span>


          <h1>
            Order Placed!
          </h1>


          <div className="order-id">

            Order ID:

            <strong>
              {orderId}
            </strong>

          </div>


          <div className="confirmation-grid">

            <div>

              <span>
                CUSTOMER
              </span>

              <strong>
                {customerDetails.name}
              </strong>

            </div>


            <div>

              <span>
                MOBILE
              </span>

              <strong>
                {customerDetails.mobile}
              </strong>

            </div>


            <div>

              <span>
                PAYMENT
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>


            <div>

              <span>
                DELIVERY ADDRESS
              </span>

              <strong>
                {customerDetails.address},
                {" "}
                {customerDetails.city},
                {" "}
                {customerDetails.state}
                {" - "}
                {customerDetails.pincode}
              </strong>

            </div>

          </div>


          <div className="confirmation-summary">

            <h2>
              Order Summary
            </h2>


            {orderItems.map(
              (item) => (

                <p key={item.id}>

                  {item.name}

                  {" — "}

                  {item.weight}

                  {" × "}

                  {item.quantity}

                  {" = ₹"}

                  {
                    item.price *
                    item.quantity
                  }

                </p>

              )
            )}


            <h3>

              Total Amount:

              {" ₹"}

              {lastOrderTotal}

            </h3>

          </div>


          <button
            className="primary-btn"
            onClick={goHome}
          >
            Back to Home →
          </button>

        </section>

      </main>
    );
  };


  /* =======================================================
     ABOUT PAGE
     ======================================================= */
        
  const AboutPage = () => {
    return (
      <main className="inner-page about-luxury-page">
        {/* HERO */}
        <section className="about-luxury-hero">
          <div className="about-hero-copy">
            <div className="about-kicker">
              <span>❧</span> OUR STORY · ROOTED IN RAJASTHAN
            </div>

            <h1>
              Ghar ka swaad,
              <em> dil se juda.</em>
            </h1>

            <p className="about-hero-description">
              Some flavours feel like home. Mangodi Wale celebrates
              the familiar taste of Rajasthan through traditional
              favourites made for everyday family moments.
            </p>

            <div className="about-hero-actions">
              <button
                className="primary-btn"
                onClick={goProducts}
              >
                Explore Our Products <span>→</span>
              </button>

              <button
                className="gold-btn"
                onClick={() => goTo("contact")}
              >
                Get in Touch <span>↗</span>
              </button>
            </div>

            <div className="about-hero-details">
              <div>
                <span className="about-detail-number">01</span>
                <div>
                  <strong>Our Roots</strong>
                  <small>Inspired by Rajasthan</small>
                </div>
              </div>

              <div>
                <span className="about-detail-number">02</span>
                <div>
                  <strong>Our Favourites</strong>
                  <small>Snacks for every moment</small>
                </div>
              </div>
            </div>
          </div>

          <div className="about-visual">
            <div className="about-photo-main">
              <img
                src="/images/mangodi.jpg"
                alt="Traditional Mangodi"
              />
            </div>

            <div className="about-photo-small about-photo-top">
              <img
                src="/images/chips.jpg"
                alt="Crispy Banana Chips"
              />
            </div>

            <div className="about-photo-small about-photo-bottom">
              <img
                src="/images/namkeen.jpg"
                alt="Mangodi Wale Namkeen"
              />
            </div>

            <div className="about-photo-caption">
              <span>THE MANGODI WALE COLLECTION</span>
              <strong>A taste of home.</strong>
            </div>

            <div className="about-round-seal">
              <span>✦</span>
              <strong>GHAR KA</strong>
              <strong>SWAAD</strong>
              <small>RAJASTHAN</small>
            </div>
          </div>
        </section>

        {/* BRAND STORY */}
        <section className="about-story-section">
          <div className="about-story-label">
            <span>❧</span>
            <p>THE HEART OF OUR BRAND</p>
            <span>❧</span>
          </div>

          <div className="about-story-content">
            <div className="about-story-heading">
              <p className="eyebrow">MORE THAN JUST A SNACK</p>
              <h2>
                Traditional taste,
                <em> made with love.</em>
              </h2>
            </div>

            <div className="about-story-text">
              <p>
                Mangodi Wale brings together familiar Rajasthani
                flavours and the comfort of food shared at home.
                Our story starts with the simple joy of enjoying
                something delicious with the people around us.
              </p>

              <p>
                From Mangodi to Banana Chips and Namkeen, every
                favourite has its own place—from chai-time breaks
                to relaxed family moments.
              </p>

              <button
                className="about-text-link"
                onClick={goProducts}
              >
                Discover our collection <span>⟶</span>
              </button>
            </div>
          </div>
        </section>

        {/* BRAND VALUES */}
        <section className="about-values-section">
          <div className="about-values-heading">
            <p className="eyebrow">WHAT MATTERS TO US</p>
            <h2>The little things that make it special.</h2>
            <p>
              A brand inspired by familiar flavours, thoughtful
              choices and the warmth of sharing food.
            </p>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <span className="about-value-number">01</span>
              <div className="about-value-icon">❧</div>
              <h3>Rooted in Tradition</h3>
              <p>
                Inspired by Rajasthan and the flavours that remind
                us of home.
              </p>
            </article>

            <article className="about-value-card about-value-featured">
              <span className="about-value-number">02</span>
              <div className="about-value-icon">✦</div>
              <h3>Made for Moments</h3>
              <p>
                Little treats for tea breaks, conversations and
                time spent with family.
              </p>
            </article>

            <article className="about-value-card">
              <span className="about-value-number">03</span>
              <div className="about-value-icon">♡</div>
              <h3>Something for Everyone</h3>
              <p>
                Mangodi, crispy Banana Chips and Namkeen in
                convenient pack sizes.
              </p>
            </article>
          </div>
        </section>

        {/* PRODUCT COLLECTION */}
        <section className="about-collection-section">
          <div className="about-collection-heading">
            <div>
              <p className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</p>
              <h2>Meet our favourites.</h2>
            </div>

            <button
              className="about-text-link"
              onClick={goProducts}
            >
              View all products <span>⟶</span>
            </button>
          </div>

          <ProductCards
            products={displayProducts}
            onOpen={openProduct}
          />
        </section>

        {/* CLOSING CTA */}
        <section className="about-closing-section">
          <div className="about-closing-decoration">❧</div>
          <p className="eyebrow">YOUR TABLE, OUR TRADITION</p>
          <h2>
            Bring home a little
            <em> ghar ka swaad.</em>
          </h2>
          <p>
            Explore familiar favourites and find something
            delicious for your next special moment.
          </p>

          <button
            className="about-closing-button"
            onClick={goProducts}
          >
            Explore the Collection <span>→</span>
          </button>
        </section>
      </main>
    );
  };

     
  /* =======================================================
     CONTACT PAGE
     ======================================================= */
     
  const ContactPage = () => {
    const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      subject: "Product enquiry",
      message: "",
    });

    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState({
      type: "",
      text: "",
    });

    function updateField(event) {
      const { name, value } = event.target;
      setForm((current) => ({ ...current, [name]: value }));
      setFeedback({ type: "", text: "" });
    }

    function chooseSubject(subject) {
      setForm((current) => ({ ...current, subject }));
      setFeedback({ type: "", text: "" });
      document.getElementById("contact-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    async function handleSubmit(event) {
      event.preventDefault();
      setFeedback({ type: "", text: "" });
      setSending(true);

      try {
        const response = await fetch("https://mangodi-wale-api.onrender.com/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Message could not be submitted.");
        }

        setFeedback({
          type: "success",
          text: "Your message has been received. Thank you for contacting Mangodi Wale!",
        });

        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "Product enquiry",
          message: "",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          text: error.message || "Unable to send your message. Please try again.",
        });
      } finally {
        setSending(false);
      }
    }

    return (
      <main className="inner-page simple-page contact-page">
        <div className="page-title contact-page-title">
          <span>GET IN TOUCH</span>
          <h1>Contact Us</h1>
          <p>
            Have a question about our products or an order?
            We would love to hear from you.
          </p>
        </div>

        <section className="contact-main-card">
          <div className="contact-card-heading">
            <span className="contact-decoration">❧</span>
            <p className="eyebrow">MANGODI WALE</p>
            <h2>How can we help you?</h2>
            <p>
              Choose the type of enquiry and send us a message
              using the form below.
            </p>
          </div>

          <div className="contact-action-grid">
            <button
              type="button"
              className="contact-action-card"
              onClick={() => chooseSubject("Product enquiry")}
            >
              <span className="contact-action-icon">✦</span>
              <strong>Product Enquiry</strong>
              <span>Ask about Mangodi, Banana Chips or Namkeen.</span>
              <small>Send an enquiry →</small>
            </button>

            <button
              type="button"
              className="contact-action-card"
              onClick={() => chooseSubject("Existing order support")}
            >
              <span className="contact-action-icon">⌂</span>
              <strong>Order Support</strong>
              <span>Questions about an order or delivery.</span>
              <small>Get order help →</small>
            </button>

            <button
              type="button"
              className="contact-action-card"
              onClick={() => chooseSubject("Bulk / business enquiry")}
            >
              <span className="contact-action-icon">❧</span>
              <strong>Business Enquiry</strong>
              <span>Discuss bulk orders or business queries.</span>
              <small>Contact our team →</small>
            </button>
          </div>

          <form
            id="contact-form"
            className="contact-form-panel"
            onSubmit={handleSubmit}
          >
            <div className="contact-form-heading">
              <p className="eyebrow">SEND US A MESSAGE</p>
              <h2>Let's talk</h2>
              <p>Fill in your details and write your enquiry below.</p>
            </div>

            <div className="contact-fields-grid">
              <label>
                Your full name *
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Enter your name"
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Phone number (optional)
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="Your contact number"
                  maxLength={20}
                  autoComplete="tel"
                />
              </label>

              <label>
                Enquiry type *
                <select
                  name="subject"
                  value={form.subject}
                  onChange={updateField}
                  required
                >
                  <option>Product enquiry</option>
                  <option>Existing order support</option>
                  <option>Bulk / business enquiry</option>
                  <option>Other question</option>
                </select>
              </label>
            </div>

            <label className="contact-message-label">
              Your message *
              <textarea
                name="message"
                value={form.message}
                onChange={updateField}
                placeholder="Tell us how we can help..."
                minLength={10}
                maxLength={2000}
                rows={6}
                required
              />
            </label>

            {feedback.text && (
              <div
                className={`contact-feedback ${feedback.type}`}
                role={feedback.type === "error" ? "alert" : "status"}
              >
                <span>{feedback.type === "success" ? "✓" : "!"}</span>
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              className="contact-submit-button"
              disabled={sending}
            >
              {sending ? "Sending your message..." : "Send Message  →"}
            </button>

            <p className="contact-privacy-note">
              Your message will be saved so your enquiry can be followed up.
            </p>
          </form>
        </section>
      </main>
    );
  };


  /* =======================================================
     PAGE ROUTER
     ======================================================= */

  const renderPage = () => {

    switch (page) {

      case "login":
  return <Login onBack={() => setPage("home")} />;

case "admin":
  return <Admin />;

      case "home":
        return <HomePage />;

      case "products":
        return <ProductsPage />;

      case "detail":
        return <ProductDetailPage />;

      case "cart":
        return <CartPage />;

      case "checkout":
       return renderCheckoutPage();

      case "confirm":
        return <ConfirmationPage />;

      case "about":
        return <AboutPage />;

      case "contact":
        return <ContactPage />;

      default:
        return <HomePage />;
    }
  };


  /* =======================================================
     APP
     ======================================================= */

  return (

    <div className="app">

      <Navbar />

      {renderPage()}

      <Footer />

    </div>

  );
}


/* =========================================================
   PRODUCT CARDS
   ========================================================= */

function ProductCards({
  products,
  onOpen,
}) {

  return (

    <div className="product-grid">

      {products.map((product) => (

        <article
          className="product-card"
          key={product.id}
        >

          <div className="product-photo">

            <img
              src={product.image}
              alt={product.name}
            />

            <span>
              {product.tag}
            </span>

          </div>


          <div className="product-body">

            <span className="product-category">
              TRADITIONAL SNACK
            </span>

            <h3>
              {product.name}
            </h3>


            <p>
              {product.description}
            </p>


            <div className="product-bottom">

              <span>
                From ₹
                {
                  product.prices["250g"]
                }
              </span>


              <button
                onClick={() =>
                  onOpen(product)
                }
              >
                View Product →
              </button>

            </div>

          </div>

        </article>

      ))}

    </div>

  );
}


export default App;