import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  return (
    <div className="card h-100 shadow-sm">
      {vehicle.image ? (
        <img
          src={vehicle.image}
          className="card-img-top"
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{ height: "220px", objectFit: "cover" }}
        />
      ) : (
        <div
          className="bg-light d-flex align-items-center justify-content-center"
          style={{ height: "220px" }}
        >
          <span className="text-muted">Vehicle image unavailable</span>
        </div>
      )}

      <div className="card-body">
        <h5 className="card-title">
          {vehicle.brand} {vehicle.model}
        </h5>

        <p className="mb-1">
          <strong>Category:</strong> {vehicle.category}
        </p>

        <p className="mb-1">
          <strong>Transmission:</strong> {vehicle.transmission}
        </p>

        <p className="mb-1">
          <strong>Fuel:</strong> {vehicle.fuel_type}
        </p>

        <p className="mb-1">
          <strong>Seats:</strong> {vehicle.seats}
        </p>

        <p>
          <strong>Price:</strong> Rs. {vehicle.price_per_day.toLocaleString()} / day
        </p>

        <p>
          <strong>Status:</strong> {vehicle.availability_status}
        </p>

        <Link
          to={`/vehicles/${vehicle.id}`}
          className="btn btn-primary w-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default VehicleCard;