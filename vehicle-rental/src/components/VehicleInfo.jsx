function VehicleInfo({ vehicle }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3>
          {vehicle.brand} {vehicle.model}
        </h3>

        <p>
          Registration: {vehicle.registration_number}
        </p>

        <p>
          Daily Price: Rs. {vehicle.price_per_day}
        </p>
      </div>
    </div>
  );
}

export default VehicleInfo;