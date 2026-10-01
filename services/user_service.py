
from sqlalchemy.orm import Session 
from models.users_model import User
from uuid import UUID 

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
    
    def remove_user(self, private_id: str) -> bool:
        try:
            user_uuid = UUID(private_id)
        except ValueError:
            return False

        user = self.session.get(User, user_uuid)

        if user is None:
            return False

        self.session.delete(user)
        self.session.commit()

        return True
    
    