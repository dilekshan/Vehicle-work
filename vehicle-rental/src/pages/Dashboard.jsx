import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteVehicle,
  getAdminDashboard,
  getAdminVehicles,
} from "../api/client";
import AdminVehicleForm from "../components/AdminVehicleForm";
import "./Dashboard.css";

function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    Promise.all([getAdminDashboard(), getAdminVehicles()])
      .then(([dashboard, fleet]) => {
        setSummary(dashboard);
        setVehicles(fleet);
      })
      .catch((err) => setError(err.message));
  }, [user]);

  if (!user) {
    return <div className="container py-5">Please login to continue.</div>;
  }

  if (user.role !== "admin") {
    return <div className="container py-5"><div className="alert alert-warning">Admin access required.</div></div>;
  }

  if (error) {
    return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!summary) {
    return <div className="container py-5">Loading dashboard...</div>;
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(`Deactivate ${vehicle.brand} ${vehicle.model}?`)) return;

    try {
      await deleteVehicle(vehicle.id);
      setVehicles((items) => items.map((item) => item.id === vehicle.id
        ? { ...item, is_active: false, availability_status: "Inactive" }
        : item));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSaved(savedVehicle) {
    setVehicles((items) => {
      const exists = items.some((item) => item.id === savedVehicle.id);
      return exists
        ? items.map((item) => item.id === savedVehicle.id ? savedVehicle : item)
        : [savedVehicle, ...items];
    });
    setEditingVehicle(null);
  }

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.is_active && vehicle.availability_status === "Available",
  );
  const categories = [...new Set(vehicles.map((vehicle) => vehicle.category))];
  const averageRate = Math.round(
    vehicles.reduce((total, vehicle) => total + vehicle.price_per_day, 0) /
      vehicles.length,
  );

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-kicker">JD FLEET CONTROL</p>
          <h1>Good morning, manager.</h1>
          <p className="dashboard-subtitle">
            Keep your fleet ready, visible, and moving.
          </p>
        </div>
        <Link className="dashboard-primary-action" to="/vehicles">
          Browse fleet <span aria-hidden="true">-&gt;</span>
        </Link>
      </section>

      <section className="dashboard-stats" aria-label="Fleet overview">
        <article className="dashboard-stat dashboard-stat--dark">
          <span className="dashboard-stat__label">Total vehicles</span>
          <strong>{summary.total_vehicles}</strong>
          <span className="dashboard-stat__note">Across the full fleet</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat__label">Available now</span>
          <strong>{availableVehicles.length}</strong>
          <span className="dashboard-stat__note dashboard-stat__note--green">
            {summary.total_vehicles ? Math.round((availableVehicles.length / summary.total_vehicles) * 100) : 0}% ready to rent
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat__label">Active bookings</span>
          <strong>{summary.total_bookings}</strong>
          <span className="dashboard-stat__note">Customer reservations</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat__label">Average daily rate</span>
          <strong>Rs. {averageRate.toLocaleString()}</strong>
          <span className="dashboard-stat__note">Per vehicle / day</span>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel dashboard-panel--wide">
          <AdminVehicleForm
            key={editingVehicle?.id || "new"}
            vehicle={editingVehicle}
            onSaved={handleSaved}
            onCancel={() => setEditingVehicle(null)}
          />
        </article>

        <article className="dashboard-panel dashboard-panel--wide">
          <div className="dashboard-panel__heading">
            <div>
              <p className="dashboard-kicker">ADMIN INVENTORY</p>
              <h2>Manage vehicles</h2>
            </div>
            <span>{vehicles.length} vehicles</span>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Vehicle</th><th>Registration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.brand} {vehicle.model}</td>
                    <td>{vehicle.registration_number}</td>
                    <td>Rs. {vehicle.price_per_day.toLocaleString()}</td>
                    <td>{vehicle.availability_status}</td>
                    <td className="text-nowrap">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditingVehicle(vehicle)}>Edit</button>
                      {vehicle.is_active && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(vehicle)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--wide">
          <div className="dashboard-panel__heading">
            <div>
              <p className="dashboard-kicker">FLEET SNAPSHOT</p>
              <h2>Recently added vehicles</h2>
            </div>
            <Link to="/vehicles">View all</Link>
          </div>
          <div className="fleet-list">
            {vehicles.slice(0, 4).map((vehicle) => (
              <Link className="fleet-row" to={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
                <span className="fleet-row__name">
                  <strong>{vehicle.brand} {vehicle.model}</strong>
                  <small>{vehicle.category} · {vehicle.year}</small>
                </span>
                <span className="fleet-row__location">{vehicle.registration_number}</span>
                <span className="availability-dot">{vehicle.availability_status}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--accent">
          <p className="dashboard-kicker">OPERATIONS</p>
          <h2>Everything in one place.</h2>
          <p>Manage reservations, compare vehicles, and keep every handover on schedule.</p>
          <div className="dashboard-actions">
            <Link to="/bookings">Review bookings <span>-&gt;</span></Link>
            <Link to="/vehicles">Manage vehicles <span>-&gt;</span></Link>
          </div>
        </article>

        <article className="dashboard-panel dashboard-breakdown">
          <div className="dashboard-panel__heading">
            <div>
              <p className="dashboard-kicker">INVENTORY MIX</p>
              <h2>Fleet by category</h2>
            </div>
            <span>{vehicles.length} vehicles</span>
          </div>
          <div className="category-bars">
            {categories.map((category) => {
              const count = vehicles.filter((vehicle) => vehicle.category === category).length;
              return (
                <div className="category-bar" key={category}>
                  <div><span>{category}</span><strong>{count}</strong></div>
                  <span className="category-bar__track"><span style={{ width: `${(count / vehicles.length) * 100}%` }} /></span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;