from datetime import date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

from app.models import Booking, Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.security.dependencies import AdminUser, DbSession


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])
BLOCKING_STATUSES = ("Confirmed", "Active")


def get_vehicle_or_404(db, vehicle_id: int) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)

    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle


def has_overlap(
    db,
    vehicle_id: int,
    start_date: date,
    end_date: date,
    exclude_booking_id: int | None = None,
) -> bool:
    query = select(Booking.id).where(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(BLOCKING_STATUSES),
        Booking.start_date <= end_date,
        Booking.end_date >= start_date,
    )

    if exclude_booking_id is not None:
        query = query.where(Booking.id != exclude_booking_id)

    return db.scalar(query.limit(1)) is not None


@router.get("/", response_model=list[VehicleResponse])
def list_vehicles(
    db: DbSession,
    search: str | None = None,
    brand: str | None = None,
    category: str | None = None,
    transmission: str | None = None,
    fuel_type: str | None = None,
    min_seats: int | None = Query(default=None, ge=1),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, gt=0),
    available_only: bool = False,
):
    query = select(Vehicle).where(Vehicle.is_active.is_(True))

    if search:
        query = query.where(
            or_(
                Vehicle.name.ilike(f"%{search}%"),
                Vehicle.brand.ilike(f"%{search}%"),
                Vehicle.model.ilike(f"%{search}%"),
            )
        )

    if brand:
        query = query.where(Vehicle.brand.ilike(f"%{brand}%"))

    if category:
        query = query.where(Vehicle.category == category)

    if transmission:
        query = query.where(Vehicle.transmission == transmission)

    if fuel_type:
        query = query.where(Vehicle.fuel_type == fuel_type)

    if min_seats is not None:
        query = query.where(Vehicle.seats >= min_seats)

    if min_price is not None:
        query = query.where(Vehicle.price_per_day >= min_price)

    if max_price is not None:
        query = query.where(Vehicle.price_per_day <= max_price)

    if available_only:
        query = query.where(Vehicle.availability_status == "Available")

    return db.scalars(query.order_by(Vehicle.id)).all()


@router.get("/{vehicle_id}/availability")
def check_availability(
    vehicle_id: int,
    start_date: date,
    end_date: date,
    db: DbSession,
):
    if start_date < date.today() or end_date < start_date:
        raise HTTPException(status_code=400, detail="Invalid rental dates")

    vehicle = get_vehicle_or_404(db, vehicle_id)

    available = (
        vehicle.is_active
        and vehicle.availability_status in {"Available", "Rented"}
        and not has_overlap(db, vehicle_id, start_date, end_date)
    )

    return {
        "vehicle_id": vehicle_id,
        "start_date": start_date,
        "end_date": end_date,
        "available": available,
    }


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: DbSession):
    vehicle = get_vehicle_or_404(db, vehicle_id)

    if not vehicle.is_active:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: DbSession,
    admin: AdminUser,
):
    vehicle = Vehicle(**data.model_dump())

    if vehicle.availability_status == "Inactive":
        vehicle.is_active = False

    db.add(vehicle)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Registration number already exists",
        )

    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: DbSession,
    admin: AdminUser,
):
    vehicle = get_vehicle_or_404(db, vehicle_id)
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if value is None and field != "image":
            raise HTTPException(
                status_code=422,
                detail=f"{field} cannot be null",
            )
        setattr(vehicle, field, value)

    if vehicle.availability_status == "Inactive":
        vehicle.is_active = False

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Registration number already exists",
        )

    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
def deactivate_vehicle(
    vehicle_id: int,
    db: DbSession,
    admin: AdminUser,
):
    vehicle = get_vehicle_or_404(db, vehicle_id)
    vehicle.is_active = False
    vehicle.availability_status = "Inactive"
    db.commit()