from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


VehicleStatus = Literal["Available", "Rented", "Maintenance", "Inactive"]


class VehicleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    brand: str = Field(min_length=2, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    year: int = Field(ge=1900, le=2100)
    registration_number: str = Field(min_length=2, max_length=30)
    category: str = Field(min_length=2, max_length=40)
    transmission: str = Field(min_length=2, max_length=30)
    fuel_type: str = Field(min_length=2, max_length=30)
    seats: int = Field(ge=1)
    price_per_day: float = Field(gt=0)
    image: str | None = None
    mileage: int = Field(ge=0)
    color: str = Field(min_length=2, max_length=40)
    availability_status: VehicleStatus = "Available"
    is_active: bool = True


class VehicleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    brand: str | None = Field(default=None, min_length=2, max_length=80)
    model: str | None = Field(default=None, min_length=1, max_length=80)
    year: int | None = Field(default=None, ge=1900, le=2100)
    registration_number: str | None = Field(default=None, min_length=2, max_length=30)
    category: str | None = Field(default=None, min_length=2, max_length=40)
    transmission: str | None = Field(default=None, min_length=2, max_length=30)
    fuel_type: str | None = Field(default=None, min_length=2, max_length=30)
    seats: int | None = Field(default=None, ge=1)
    price_per_day: float | None = Field(default=None, gt=0)
    image: str | None = None
    mileage: int | None = Field(default=None, ge=0)
    color: str | None = Field(default=None, min_length=2, max_length=40)
    availability_status: VehicleStatus | None = None
    is_active: bool | None = None


class VehicleResponse(VehicleCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int