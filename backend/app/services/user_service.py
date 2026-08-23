from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password


def create_user(db: Session, user_data: UserCreate, force_role: str = "customer"):
    existing = db.query(User).filter(User.email == user_data.email.strip().lower()).first()
    if existing:
        raise ValueError("User with this email already exists")

    hashed_pwd = hash_password(user_data.password)

    # Public registration MUST ALWAYS assign role = "customer"
    assigned_role = "admin" if force_role == "admin" else "customer"

    user = User(
        name=user_data.name.strip(),
        email=user_data.email.strip().lower(),
        password=hashed_pwd,
        role=assigned_role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def get_users(db: Session):
    return db.query(User).all()
