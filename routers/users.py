from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from settings import get_db
from models.users_model import User
from schemas.user_schema import AdminUserCreate, UserOut, UserRoleUpdate, UserUpdate
from services.user_service import UserService
from core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin)],
)
def create_user(payload: AdminUserCreate, db: Session = Depends(get_db)):
    user_svc = UserService(db)
    if user_svc.get_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    try:
        return user_svc.create_user(
            email=payload.email,
            name=payload.name,
            password=payload.password,
            role=payload.role,
            contact=payload.contact,
        )
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from error


@router.get("", response_model=List[UserOut], dependencies=[Depends(get_current_admin)])
def list_users(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    user_svc = UserService(db)
    return user_svc.get_all_users(offset=offset, limit=limit)


@router.get("/{public_id}", response_model=UserOut)
def get_user_by_id(
    public_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_svc = UserService(db)
    user = user_svc.get_by_public_id(public_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {public_id} not found",
        )
    if current_user.public_id != public_id and current_user.user_role.name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile",
        )
    return user


@router.put("/{public_id}", response_model=UserOut)
def update_user_profile(
    public_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_svc = UserService(db)
    user = user_svc.get_by_public_id(public_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Only user themselves or Admin can update
    is_admin = current_user.user_role.name == "ADMIN"
    if current_user.public_id != public_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    updated_user = user_svc.update_user(
        public_id, updates=payload.model_dump(exclude_unset=True)
    )
    return updated_user


@router.patch(
    "/{public_id}/role",
    response_model=UserOut,
    dependencies=[Depends(get_current_admin)],
)
def update_user_role(
    public_id: UUID,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
):
    user = UserService(db).update_user_role(public_id, payload.role)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/{public_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_user(public_id: UUID, db: Session = Depends(get_db)):
    user_svc = UserService(db)
    try:
        success = user_svc.remove_user(public_id)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a user referenced by existing records",
        ) from error
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
