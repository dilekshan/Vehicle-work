import { useState } from "react";
import { createVehicle, updateVehicle } from "../api/client";

const emptyVehicle = {
  name: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  registration_number: "",
  category: "",
  transmission: "Automatic",
  fuel_type: "Petrol",
  seats: 5,
  price_per_day: 0,
  image: "",
  mileage: 0,
  color: "",
  availability_status: "Available",
  is_active: true,
};

function AdminVehicleForm({ vehicle, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (
    vehicle ? { ...vehicle, image: vehicle.image || "" } : emptyVehicle
  ));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      ...form,
      year: Number(form.year),
      seats: Number(form.seats),
      price_per_day: Number(form.price_per_day),
      mileage: Number(form.mileage),
      image: form.image || null,
    };

    try {
      const saved = vehicle
        ? await updateVehicle(vehicle.id, data)
        : await createVehicle(data);
      onSaved(saved);
      if (!vehicle) setForm(emptyVehicle);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-vehicle-form" onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">{vehicle ? "Edit vehicle" : "Add vehicle"}</h2>
        {vehicle && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {[
          ["name", "Vehicle name"],
          ["brand", "Brand"],
          ["model", "Model"],
          ["registration_number", "Registration number"],
          ["category", "Category"],
          ["transmission", "Transmission"],
          ["fuel_type", "Fuel type"],
          ["color", "Color"],
          ["image", "Image URL"],
        ].map(([name, label]) => (
          <div className="col-md-4" key={name}>
            <label className="form-label" htmlFor={`vehicle-${name}`}>{label}</label>
            <input id={`vehicle-${name}`} name={name} className="form-control" value={form[name]} onChange={updateField} required={name !== "image"} />
          </div>
        ))}
        <div className="col-md-3"><label className="form-label" htmlFor="vehicle-year">Year</label><input id="vehicle-year" name="year" type="number" className="form-control" value={form.year} onChange={updateField} min="1900" max="2100" required /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="vehicle-seats">Seats</label><input id="vehicle-seats" name="seats" type="number" className="form-control" value={form.seats} onChange={updateField} min="1" required /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="vehicle-price">Price per day</label><input id="vehicle-price" name="price_per_day" type="number" className="form-control" value={form.price_per_day} onChange={updateField} min="0.01" step="0.01" required /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="vehicle-mileage">Mileage</label><input id="vehicle-mileage" name="mileage" type="number" className="form-control" value={form.mileage} onChange={updateField} min="0" required /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="vehicle-status">Availability</label><select id="vehicle-status" name="availability_status" className="form-select" value={form.availability_status} onChange={updateField}><option>Available</option><option>Rented</option><option>Maintenance</option><option>Inactive</option></select></div>
        <div className="col-md-4 d-flex align-items-end"><div className="form-check mb-2"><input id="vehicle-active" name="is_active" type="checkbox" className="form-check-input" checked={form.is_active} onChange={updateField} /><label className="form-check-label" htmlFor="vehicle-active">Active vehicle</label></div></div>
      </div>
      <button className="btn btn-primary mt-4" disabled={saving}>{saving ? "Saving..." : vehicle ? "Update vehicle" : "Add vehicle"}</button>
    </form>
  );
}

export default AdminVehicleForm;
