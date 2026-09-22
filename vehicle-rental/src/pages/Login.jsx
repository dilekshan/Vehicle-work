import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser } from "../api/client";
import "./Login.css";
import loginImage from "../assets/image/ChatGPT Image Sep 22, 2026, 12_14_53 PM.png";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      sessionStorage.setItem("access_token", result.access_token);
      const currentUser = await getCurrentUser();
      onLogin(currentUser);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 26, 43, 0.35), rgba(7, 26, 43, 0.08)), url("${loginImage}")` }}>
      <section className="login-visual">
        <div className="login-visual__content">
          <span className="login-visual__mark">JD</span>
          <p className="login-visual__eyebrow">Vehicle Rental</p>
          <h1>Move freely.<br />Arrive ready.</h1>
          <p>Access your rental account and keep every journey in motion.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="login-kicker">WELCOME BACK</p>
          <h2>Sign in to continue</h2>
          <p className="login-description">Manage your bookings and find your next vehicle.</p>
          {error && <div className="alert alert-danger login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </div>
            <button className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span aria-hidden="true">-&gt;</span>}
            </button>
          </form>
          <p className="login-register">New customer? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}

export default Login;
