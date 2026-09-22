function BookingSummary({
  vehicle,
  rentalDays,
  rentalPrice,
  finalAmount
}) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3>Booking Summary</h3>

        <p>
          Vehicle: {vehicle.brand} {vehicle.model}
        </p>

        <p>
          Daily Price: Rs. {vehicle.price_per_day}
        </p>

        <p>
          Rental Days: {rentalDays}
        </p>

        <hr />

        <p>
          Vehicle Rental: Rs. {rentalPrice}
        </p>

        <hr />

        <h4>
          Final Amount: Rs. {finalAmount.toFixed(2)}
        </h4>
      </div>
    </div>
  );
}

export default BookingSummary; 