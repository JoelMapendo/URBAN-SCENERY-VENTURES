
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.users_model import User
from uuid import UUID


_UPDATABLE_FIELDS = {"name", "email", "role", "contact"}

class UserService :
    
    def __init__(self ,session : Session):
        self.session = session
        
    def create_user(
                    self ,
                    email : str ,
                    name : str
                ) -> User :
        
        
        user = User(
            email = email ,
            name = name
        )
        
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        
        return user
    
    def get_user(self, private_id: str) -> User | None:
        try:
            user_uuid = UUID(private_id)
        except (TypeError, ValueError):
            return None

        return self.session.get(User, user_uuid)

    def get_all_users(self, offset: int = 0, limit: int = 100) -> list[User]:
        statement = select(User).offset(offset).limit(limit)
        return list(self.session.scalars(statement).all())

    def update_user(
        self, private_id: str, updates: dict[str, object] | None = None
    ) -> User | None:
        user = self.get_user(private_id)
        if user is None:
            return None

        updates = updates or {}
        invalid_fields = updates.keys() - _UPDATABLE_FIELDS
        if invalid_fields:
            raise ValueError(f"Unsupported user fields: {', '.join(sorted(invalid_fields))}")

        for field, value in updates.items():
            setattr(user, field, value)

        self.session.commit()
        self.session.refresh(user)
        return user

    def remove_user(self, private_id: str) -> bool:
        user = self.get_user(private_id)
        if user is None:
            return False

        self.session.delete(user)
        self.session.commit()
        return True
    

