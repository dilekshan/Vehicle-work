from datetime import date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from app.models import Booking, Vehicle
from app.routers.vehicles import has_overlap
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.security.dependencies import AdminUser, CurrentUser, DbSession


router = APIRouter(prefix="/bookings", tags=["Bookings"])

ALLOWED_TRANSITIONS = {
    "Pending": {"Confirmed", "Cancelled"},
    "Confirmed": {"Active", "Cancelled"},
    "Active": {"Completed"},
    "Completed": set(),
    "Cancelled": set(),
}


def booking_or_404(db, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    return booking


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    data: BookingCreate,
    db: DbSession,
    customer: CurrentUser,
):
    if customer.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Customer account required",
        )

    vehicle = db.scalar(
        select(Vehicle)
        .where(Vehicle.id == data.vehicle_id)
        .with_for_update()
    )

    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if (
        not vehicle.is_active
        or vehicle.availability_status not in {"Available", "Rented"}
    ):
        raise HTTPException(status_code=409, detail="Vehicle unavailable")

    if has_overlap(db, vehicle.id, data.start_date, data.end_date):
        raise HTTPException(
            status_code=409,
            detail="Vehicle already booked for these dates",
        )

    days = (data.end_date - data.start_date).days + 1

    booking = Booking(
        customer_id=customer.id,
        vehicle_id=vehicle.id,
        start_date=data.start_date,
        end_date=data.end_date,
        days=days,
        price_per_day=vehicle.price_per_day,
        total_amount=round(days * vehicle.price_per_day, 2),
        status="Pending",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/mine", response_model=list[BookingResponse])
def my_bookings(db: DbSession, customer: CurrentUser):
    query = (
        select(Booking)
        .where(Booking.customer_id == customer.id)
        .order_by(Booking.id.desc())
    )
    return db.scalars(query).all()


@router.get("/mine/{booking_id}", response_model=BookingResponse)
def my_booking_detail(
    booking_id: int,
    db: DbSession,
    customer: CurrentUser,
):
    booking = booking_or_404(db, booking_id)

    if booking.customer_id != customer.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    return booking


@router.patch(
    "/mine/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_my_booking(
    booking_id: int,
    db: DbSession,
    customer: CurrentUser,
):
    booking = booking_or_404(db, booking_id)

    if booking.customer_id != customer.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if (
        booking.status not in {"Pending", "Confirmed"}
        or booking.start_date <= date.today()
    ):
        raise HTTPException(
            status_code=409,
            detail="Booking cannot be cancelled",
        )

    booking.status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/", response_model=list[BookingResponse])
def all_bookings(
    db: DbSession,
    admin: AdminUser,
    status: str | None = None,
    customer_id: int | None = None,
    vehicle_id: int | None = None,
    search: str | None = Query(default=None),
):
    query = select(Booking)

    if status:
        query = query.where(Booking.status == status)

    if customer_id is not None:
        query = query.where(Booking.customer_id == customer_id)

    if vehicle_id is not None:
        query = query.where(Booking.vehicle_id == vehicle_id)

    if search:
        if not search.isdigit():
            return []
        query = query.where(Booking.id == int(search))

    return db.scalars(query.order_by(Booking.id.desc())).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def admin_booking_detail(
    booking_id: int,
    db: DbSession,
    admin: AdminUser,
):
    return booking_or_404(db, booking_id)


@router.patch(
    "/{booking_id}/status",
    response_model=BookingResponse,
)
def update_booking_status(
    booking_id: int,
    data: BookingUpdate,
    db: DbSession,
    admin: AdminUser,
):
    booking = booking_or_404(db, booking_id)

    if data.status not in ALLOWED_TRANSITIONS[booking.status]:
        raise HTTPException(
            status_code=409,
            detail="Invalid status transition",
        )

    vehicle = db.scalar(
        select(Vehicle)
        .where(Vehicle.id == booking.vehicle_id)
        .with_for_update()
    )

    if data.status in {"Confirmed", "Active"}:
        if (
            vehicle is None
            or not vehicle.is_active
            or vehicle.availability_status in {"Maintenance", "Inactive"}
        ):
            raise HTTPException(status_code=409, detail="Vehicle unavailable")

        if has_overlap(
            db,
            booking.vehicle_id,
            booking.start_date,
            booking.end_date,
            booking.id,
        ):
            raise HTTPException(
                status_code=409,
                detail="Vehicle already booked for these dates",
            )

    if data.status == "Confirmed" and booking.start_date < date.today():
        raise HTTPException(
            status_code=409,
            detail="Rental start date has passed",
        )

    booking.status = data.status

    if vehicle is not None:
        if data.status == "Active":
            vehicle.availability_status = "Rented"
        elif (
            data.status == "Completed"
            and vehicle.availability_status == "Rented"
        ):
            vehicle.availability_status = "Available"

    db.commit()
    db.refresh(booking)
    return booking