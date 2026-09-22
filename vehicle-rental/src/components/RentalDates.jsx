function RentalDates({ booking, dispatch }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3>Rental Dates</h3>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Pickup Date
            </label>

            <input
              type="date"
              className="form-control"
              value={booking.pickupDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_PICKUP_DATE",
                  payload: e.target.value
                })
              }
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">
              Return Date
            </label>

            <input
              type="date"
              className="form-control"
              value={booking.returnDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_RETURN_DATE",
                  payload: e.target.value
                })
              }
              required
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default RentalDates;