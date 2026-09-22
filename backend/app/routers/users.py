from fastapi import APIRouter

from app.schemas.user import UserResponse, UserUpdate
from app.security.dependencies import CurrentUser, DbSession


router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user