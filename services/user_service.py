from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.users_model import User
from models.utils import UserRole
from core.security import hash_password

_UPDATABLE_FIELDS = {"name", "contact", "role"}


class UserService:
    def __init__(self, session: Session):
        self.session = session

    def create_user(
        self,
        email: str,
        name: str,
        password: Optional[str] = None,
        role: UserRole = UserRole.Customer,
        contact: Optional[str] = None,
    ) -> User:
        hashed = hash_password(password) if password else None
        user = User(
            email=email.strip().lower(),
            name=name.strip(),
            hashed_password=hashed,
            role=role,
            contact=contact,
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email.strip().lower())
        return self.session.scalars(statement).first()

    def get_by_public_id(self, public_id: UUID) -> Optional[User]:
        statement = select(User).where(User.public_id == public_id)
        return self.session.scalars(statement).first()

    def get_user(self, private_id: str | UUID) -> Optional[User]:
        try:
            user_uuid = UUID(str(private_id))
        except (TypeError, ValueError):
            return None
        return self.session.get(User, user_uuid)

    def get_all_users(self, offset: int = 0, limit: int = 100) -> List[User]:
        statement = select(User).offset(offset).limit(limit)
        return list(self.session.scalars(statement).all())

    def update_user(
        self, public_id: UUID, updates: dict[str, object] | None = None
    ) -> Optional[User]:
        user = self.get_by_public_id(public_id)
        if user is None:
            return None

        updates = updates or {}
        for field, value in updates.items():
            if field in _UPDATABLE_FIELDS and value is not None:
                setattr(user, field, value)

        self.session.commit()
        self.session.refresh(user)
        return user

    def remove_user(self, public_id: UUID) -> bool:
        user = self.get_by_public_id(public_id)
        if user is None:
            return False

        self.session.delete(user)
        self.session.commit()
        return True
