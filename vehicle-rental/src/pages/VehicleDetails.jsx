import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getVehicle } from "../api/client";


function VehicleDetails() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getVehicle(id)
      .then((data) => {
        if (!cancelled) {
          setVehicle(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="container py-5">Loading vehicle...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="container py-5 text-center">
        <h2>Vehicle Not Found</h2>
        <p>{error}</p>

        <Link to="/vehicles" className="btn btn-primary mt-3">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="img-fluid rounded"
            />
          ) : (
            <div className="bg-light rounded p-5 text-center text-muted">
              Vehicle image unavailable
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>

          <p>
            <strong>Registration:</strong>{" "}
            {vehicle.registration_number}
          </p>
          <p>
            <strong>Category:</strong> {vehicle.category}
          </p>
          <p>
            <strong>Year:</strong> {vehicle.year}
          </p>
          <p>
            <strong>Price:</strong> Rs. {vehicle.price_per_day} / day
          </p>
          <p>
            <strong>Transmission:</strong> {vehicle.transmission}
          </p>
          <p>
            <strong>Fuel:</strong> {vehicle.fuel_type}
          </p>
          <p>
            <strong>Seats:</strong> {vehicle.seats}
          </p>
          <p>
            <strong>Availability:</strong>{" "}
            {vehicle.availability_status}
          </p>

          {vehicle.availability_status === "Available" && (
            <Link
              to={`/booking/${vehicle.id}`}
              className="btn btn-success"
            >
              Rent This Vehicle
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleDetails;