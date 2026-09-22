from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security.passwords import hash_password


def main():
    email = input("Admin email: ").strip().lower()
    full_name = input("Full name: ").strip()
    phone = input("Phone: ").strip()
    password = getpass("New password (8+ chars): ")

    if (
        not email
        or "@" not in email
        or len(full_name) < 2
        or len(phone) < 7
        or len(password) < 8
    ):
        raise SystemExit("Invalid admin details")

    with SessionLocal() as db:
        existing_user_id = db.scalar(
            select(User.id).where(User.email == email)
        )

        if existing_user_id is not None:
            raise SystemExit(
                "Email already registered; choose another email"
            )

        admin = User(
            email=email,
            full_name=full_name,
            phone=phone,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

    print("Admin account created")


if __name__ == "__main__":
    main()