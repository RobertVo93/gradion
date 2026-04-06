from collections.abc import Callable
from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Permission(str, Enum):
    REPORT_CREATE = "report.create"
    REPORT_READ = "report.read"
    REPORT_UPDATE = "report.update"
    REPORT_DELETE = "report.delete"
    REPORT_APPROVE = "report.approve"
    REPORT_REJECT = "report.reject"
    EXPENSE_ITEM_CREATE = "expense_item.create"
    EXPENSE_ITEM_READ = "expense_item.read"
    EXPENSE_ITEM_UPDATE = "expense_item.update"
    EXPENSE_ITEM_DELETE = "expense_item.delete"


Scope = str  # "own" | "all"

ROLE_PERMISSIONS: dict[UserRole, set[tuple[Permission, Scope]]] = {
    UserRole.USER: {
        (Permission.REPORT_CREATE, "own"),
        (Permission.REPORT_READ, "own"),
        (Permission.REPORT_UPDATE, "own"),
        (Permission.REPORT_DELETE, "own"),
        (Permission.EXPENSE_ITEM_CREATE, "own"),
        (Permission.EXPENSE_ITEM_READ, "own"),
        (Permission.EXPENSE_ITEM_UPDATE, "own"),
        (Permission.EXPENSE_ITEM_DELETE, "own"),
    },
    UserRole.ADMIN: {
        (Permission.REPORT_READ, "all"),
        (Permission.REPORT_APPROVE, "all"),
        (Permission.REPORT_REJECT, "all"),
    },
}


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except (JWTError, ValueError) as exc:
        raise credentials_exception from exc

    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return current_user

    return checker


def _has_permission(current_user: User, permission: Permission, scope: Scope) -> bool:
    entries = ROLE_PERMISSIONS.get(current_user.role, set())
    if (permission, scope) in entries:
        return True
    if scope == "own" and (permission, "all") in entries:
        return True
    return False


def require_permission(permission: Permission, scope: Scope = "own") -> Callable[[User], User]:
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if not _has_permission(current_user, permission, scope):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return current_user

    return checker
