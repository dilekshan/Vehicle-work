import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser } from "../api/client";

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
    <div className="container py-5" style={{ maxWidth: "520px" }}>
      <h1 className="mb-4">Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="login-email">Email</label>
        <input id="login-email" className="form-control mb-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label className="form-label" htmlFor="login-password">Password</label>
        <input id="login-password" className="form-control mb-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-3">New customer? <Link to="/register">Create an account</Link></p>
    </div>
  );
}

export default Login;
