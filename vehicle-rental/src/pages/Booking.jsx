import { useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking, getVehicle, apiRequest } from "../api/client";

import VehicleInfo from "../components/VehicleInfo";
import RentalDates from "../components/RentalDates";
import BookingSummary from "../components/BookingSummary";

import {
  initialBookingState,
  bookingReducer
} from "../reducers/bookingReducer";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [state, dispatch] = useReducer(
    bookingReducer,
    {
      ...initialBookingState,
      vehicleId: Number(id)
    }
  );

  useEffect(() => {
    getVehicle(id)
      .then(setVehicle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container py-5">Loading vehicle...</div>;
  }

  if (!vehicle) {
    return (
      <div className="container py-5">
        <h2>Vehicle Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  const rentalDays = state.pickupDate && state.returnDate
    ? Math.floor((new Date(`${state.returnDate}T00:00:00`) - new Date(`${state.pickupDate}T00:00:00`)) / 86400000) + 1
    : 0;
  const rentalPrice = vehicle.price_per_day * Math.max(rentalDays, 0);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!sessionStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }

    if (rentalDays <= 0) return;

    setSubmitting(true);
    setError("");
    try {
      await apiRequest(`/vehicles/${vehicle.id}/availability?start_date=${state.pickupDate}&end_date=${state.returnDate}`);
      await createBooking({
        vehicle_id: vehicle.id,
        start_date: state.pickupDate,
        end_date: state.returnDate,
      });
      navigate("/bookings");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Book Vehicle</h1>

      <form onSubmit={handleSubmit}>
        <VehicleInfo vehicle={vehicle} />

        <RentalDates
          booking={state}
          dispatch={dispatch}
        />

        <BookingSummary
          vehicle={vehicle}
          rentalDays={rentalDays}
          rentalPrice={rentalPrice}
          finalAmount={rentalPrice}
        />

        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-success btn-lg" disabled={submitting}>
          {submitting ? "Creating booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default Booking;