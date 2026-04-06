from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

pytest.importorskip("jose")

from app.db.session import get_db
from app.main import app
from app.models.base import Base
from app.models.user import User, UserRole
from app.core.security import hash_password


def _create_admin(db: Session) -> None:
    admin = User(
        email="admin.integration@example.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_report_happy_path_draft_to_submitted_to_approved() -> None:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            db = TestingSessionLocal()
            try:
                _create_admin(db)
            finally:
                db.close()

            signup_response = client.post(
                "/auth/signup",
                json={"email": "user.integration@example.com", "password": "User123!"},
            )
            assert signup_response.status_code == 201

            user_login = client.post(
                "/auth/login",
                json={"email": "user.integration@example.com", "password": "User123!"},
            )
            assert user_login.status_code == 200
            user_token = user_login.json()["access_token"]

            admin_login = client.post(
                "/auth/login",
                json={"email": "admin.integration@example.com", "password": "Admin123!"},
            )
            assert admin_login.status_code == 200
            admin_token = admin_login.json()["access_token"]

            create_report = client.post(
                "/reports",
                headers=_auth_headers(user_token),
                json={"title": "Integration Report", "description": "happy path"},
            )
            assert create_report.status_code == 201
            report_id = create_report.json()["id"]
            assert create_report.json()["status"] == "DRAFT"

            submit_report = client.post(
                f"/reports/{report_id}/submit",
                headers=_auth_headers(user_token),
            )
            assert submit_report.status_code == 200
            assert submit_report.json()["status"] == "SUBMITTED"

            approve_report = client.post(
                f"/admin/reports/{report_id}/approve",
                headers=_auth_headers(admin_token),
            )
            assert approve_report.status_code == 200
            assert approve_report.json()["status"] == "APPROVED"
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
