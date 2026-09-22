import { useEffect, useState } from "react";
import { Link, Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import { getCurrentUser } from "./api/client";

import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ user, authReady, children }) {
  if (!authReady) {
    return <div className="container py-5">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(
    () => !sessionStorage.getItem("access_token"),
  );

  useEffect(() => {
    if (!sessionStorage.getItem("access_token")) return;

    getCurrentUser()
      .then(setUser)
      .catch(() => sessionStorage.removeItem("access_token"))
      .finally(() => setAuthReady(true));
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <Link className="navbar-brand app-brand" to="/">
            <span className="app-brand__mark">JD</span>
            <span>Vehicle Rental</span>
          </Link>

          <div className="navbar-nav app-nav-links">
            {user && (
              <>
                <Link className="nav-link" to="/">
                  Home
                </Link>
                <Link className="nav-link" to="/vehicles">
                  Vehicles
                </Link>
                <Link className="nav-link" to="/bookings">
                  My Bookings
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            )}

            {user ? (
              <button className="nav-link btn btn-link" onClick={handleLogout}>
                Logout ({user.full_name})
              </button>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute user={user} authReady={authReady}><Home /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute user={user} authReady={authReady}><Vehicles /></ProtectedRoute>} />
          <Route
            path="/vehicles/:id"
            element={<ProtectedRoute user={user} authReady={authReady}><VehicleDetails /></ProtectedRoute>}
          />
          <Route path="/booking/:id" element={<ProtectedRoute user={user} authReady={authReady}><Booking /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute user={user} authReady={authReady}><MyBookings /></ProtectedRoute>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} authReady={authReady}>
                {user?.role === "admin" ? <Dashboard user={user} /> : <Navigate to="/bookings" replace />}
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="*"
            element={
              <div className="container py-5 text-center">
                <h1>404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;