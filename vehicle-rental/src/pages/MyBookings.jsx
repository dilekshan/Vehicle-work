import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelBooking, getMyBookings } from "../api/client";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }

    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message));
  }, [navigate]);

  async function handleCancel(id) {
    try {
      const updated = await cancelBooking(id);
      setBookings((items) => items.map((item) => item.id === id ? updated : item));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container py-5">
      <h1>My Bookings</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="alert alert-info">
          No bookings available.
        </div>
      ) : (
        bookings.map((booking) => (
          <div className="card mb-3" key={booking.id}>
            <div className="card-body">
              <h5>Booking ID: {booking.id}</h5>
              <p>
                {booking.start_date} to {booking.end_date}
              </p>
              <p>Total: Rs. {booking.total_amount.toLocaleString()}</p>
              <p>Status: {booking.status}</p>
              {booking.status === "Pending" || booking.status === "Confirmed" ? (
                <button className="btn btn-outline-danger" onClick={() => handleCancel(booking.id)}>
                  Cancel booking
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;