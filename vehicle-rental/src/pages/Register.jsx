import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/client";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "520px" }}>
      <h1 className="mb-4">Create account</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="full-name">Full name</label>
        <input id="full-name" name="full_name" className="form-control mb-3" value={form.full_name} onChange={updateField} required />
        <label className="form-label" htmlFor="register-email">Email</label>
        <input id="register-email" name="email" className="form-control mb-3" type="email" value={form.email} onChange={updateField} required />
        <label className="form-label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" className="form-control mb-3" value={form.phone} onChange={updateField} required />
        <label className="form-label" htmlFor="register-password">Password</label>
        <input id="register-password" name="password" className="form-control mb-3" type="password" minLength="8" value={form.password} onChange={updateField} required />
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-3">Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
