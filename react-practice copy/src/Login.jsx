
import { useState } from "react";
import "./Login.css";

const API_URL = "https://mangodi-wale-api.onrender.com/api/auth";

export default function Login({ onBack }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const response = await fetch(`${API_URL}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "register" ? { name } : {}),
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (mode === "register") {
        setMessage("Account created! You can log in now.");
        setMode("login");
        setPassword("");
      } else {
        // Temporary session for this learning/demo version.
        // For production, prefer a secure HttpOnly cookie.
        sessionStorage.setItem("mangodiUser", JSON.stringify(data.user));
        sessionStorage.setItem("mangodiToken", data.token);

        setMessage(`Welcome, ${data.user.name}!`);
        window.dispatchEvent(
          new CustomEvent("mangodi-login", { detail: data.user })
        );
      }
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Backend is not reachable. Please start the server."
          : error.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <button className="login-back" type="button" onClick={onBack}>
          ← Back to store
        </button>

        <div className="login-brand">Mangodi Wale</div>
        <p className="login-tagline">
          Traditional taste, delivered with love.
        </p>

        <div className="login-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Create Account
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome back!" : "Join our family"}</h2>
        <p className="login-description">
          {mode === "login"
            ? "Log in to continue shopping."
            : "Create your account to get started."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={254}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "login"
                  ? "Enter your password"
                  : "Create at least 8 characters"
              }
              minLength={mode === "register" ? 8 : undefined}
              maxLength={72}
              required
            />
          </label>

          <button className="login-submit" type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Login to Account"
                : "Create My Account"}
          </button>
        </form>

        {message && (
          <p className="login-message" role="status">
            {message}
          </p>
        )}

        <p className="login-footer">
          Fresh snacks. Authentic flavour. ❤️
        </p>
      </section>
    </main>
  );
}
