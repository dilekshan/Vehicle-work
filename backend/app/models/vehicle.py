from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    brand: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    registration_number: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False
    )
    category: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    transmission: Mapped[str] = mapped_column(String(30), nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(30), nullable=False)
    seats: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    image: Mapped[str | None] = mapped_column(Text, nullable=True)
    mileage: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str] = mapped_column(String(40), nullable=False)
    availability_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="Available"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)