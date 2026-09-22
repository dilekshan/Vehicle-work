import { useEffect, useState } from "react";
import { getVehicles } from "../api/client";
import VehicleCard from "../components/VehicleCard";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    getVehicles()
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const searchValue = search.toLowerCase();

      return (
        vehicle.brand.toLowerCase().includes(searchValue) ||
        vehicle.model.toLowerCase().includes(searchValue) ||
        vehicle.registration_number
          .toLowerCase()
          .includes(searchValue)
      );
    })
    .filter((vehicle) => {
      if (category === "All") {
        return true;
      }

      return vehicle.category === category;
    })
    .filter((vehicle) => {
      if (minPrice && vehicle.price_per_day < Number(minPrice)) {
        return false;
      }

      if (maxPrice && vehicle.price_per_day > Number(maxPrice)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "low") {
        return a.price_per_day - b.price_per_day;
      }

      if (sort === "high") {
        return b.price_per_day - a.price_per_day;
      }

      if (sort === "newest") {
        return b.year - a.year;
      }

      if (sort === "oldest") {
        return a.year - b.year;
      }

      return 0;
    });
  const categories = [...new Set(vehicles.map((vehicle) => vehicle.category))].sort();

  return (
    <div className="container py-4">
      <h1 className="mb-4">Available Vehicles</h1>

      {loading && <p>Loading vehicles...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search brand, model or registration"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="low">Price Low to High</option>
            <option value="high">Price High to Low</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {!loading && filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <div className="col-md-4" key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-warning">
              No vehicles found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Vehicles;