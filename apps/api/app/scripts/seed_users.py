from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole
from app.core.security import hash_password

DEFAULT_USERS = [
    {
        "email": "admin@example.com",
        "password": "Admin123!",
        "role": UserRole.ADMIN,
    },
    {
        "email": "user@example.com",
        "password": "User123!",
        "role": UserRole.USER,
    },
]


def upsert_default_users() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for default_user in DEFAULT_USERS:
            user = db.query(User).filter(User.email == default_user["email"]).one_or_none()
            if user:
                user.role = default_user["role"]
                db.add(user)
                print(f"Updated existing user: {user.email} ({user.role.value})")
            else:
                db.add(
                    User(
                        email=default_user["email"],
                        password_hash=hash_password(default_user["password"]),
                        role=default_user["role"],
                    )
                )
                print(f"Created user: {default_user['email']} ({default_user['role'].value})")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    upsert_default_users()
