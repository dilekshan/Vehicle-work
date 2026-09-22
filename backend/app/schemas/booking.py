from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


BookingStatus = Literal[
    "Pending", "Confirmed", "Active", "Completed", "Cancelled"
]


class BookingCreate(BaseModel):
    vehicle_id: int = Field(gt=0)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date < date.today():
            raise ValueError("Start date cannot be in the past")
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date")
        return self


class BookingUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    vehicle_id: int
    start_date: date
    end_date: date
    days: int
    price_per_day: float
    total_amount: float
    status: BookingStatus
    created_at: datetime