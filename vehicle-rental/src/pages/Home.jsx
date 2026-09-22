import { useEffect, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { getVehicles } from '../api/client';
import homeImage from '../assets/image/ChatGPT Image Sep 22, 2026, 12_12_59 PM.png';

function Home() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  const categories = new Set(vehicles.map((vehicle) => vehicle.category));

  return (
    <section
      className="home-hero"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(7, 26, 43, 0.88), rgba(7, 26, 43, 0.38)), url("${homeImage}")`,
      }}
    >
      <div className="home-hero__content container">
        <p className="home-hero__eyebrow">Drive further. Arrive happier.</p>
        <h1>Vehicle Rental Management System</h1>
        <p className="home-hero__lead">
          Find and rent your perfect vehicle with flexible plans, transparent
          pricing, and a smoother journey from start to finish.
        </p>
        <div className="home-hero__actions">
          <Link className="btn btn-primary" to="/vehicles">
            Browse vehicles
          </Link>
          <Link className="btn btn-outline-light" to="/bookings">
            View my bookings
          </Link>
        </div>
        <div className="home-hero__stats" aria-label="Rental benefits">
          <span><strong>{vehicles.length}</strong> vehicles</span>
          <span><strong>{categories.size}</strong> categories</span>
          <span><strong>{vehicles.filter((vehicle) => vehicle.availability_status === 'Available').length}</strong> available now</span>
        </div>
      </div>
    </section>
  );
}

export default Home;
