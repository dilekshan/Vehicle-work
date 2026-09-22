from fastapi import APIRouter
from sqlalchemy import func, select

from app.models import Booking, User, Vehicle
from app.schemas.vehicle import VehicleResponse
from app.security.dependencies import AdminUser, DbSession


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def dashboard(db: DbSession, admin: AdminUser):
    def count(model, *conditions):
        query = select(func.count()).select_from(model).where(*conditions)
        return db.scalar(query) or 0

    revenue_query = select(
        func.coalesce(func.sum(Booking.total_amount), 0)
    ).where(Booking.status == "Completed")

    return {
        "total_customers": count(User, User.role == "customer"),
        "total_vehicles": count(Vehicle),
        "available_vehicles": count(
            Vehicle,
            Vehicle.is_active.is_(True),
            Vehicle.availability_status == "Available",
        ),
        "rented_vehicles": count(
            Vehicle,
            Vehicle.availability_status == "Rented",
        ),
        "maintenance_vehicles": count(
            Vehicle,
            Vehicle.availability_status == "Maintenance",
        ),
        "total_bookings": count(Booking),
        "pending_bookings": count(
            Booking,
            Booking.status == "Pending",
        ),
        "active_bookings": count(
            Booking,
            Booking.status == "Active",
        ),
        "completed_bookings": count(
            Booking,
            Booking.status == "Completed",
        ),
        "total_rental_revenue": float(db.scalar(revenue_query) or 0),
    }


@router.get("/vehicles", response_model=list[VehicleResponse])
def all_vehicles(db: DbSession, admin: AdminUser):
    return db.scalars(
        select(Vehicle).order_by(Vehicle.id.desc())
    ).all()