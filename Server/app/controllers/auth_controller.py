from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.models import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token, verify_token
from app.db.database import get_db
from datetime import timedelta
from starlette import status



def signup(user: UserCreate, db: Session):
    # Check if the user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use")

    # Hash the user's password
    hashed_password = hash_password(user.password)

    # Create new user instance
    new_user = User(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


# Signin: Authenticate a user and return a JWT token
def signin(user: UserLogin, db: Session):
    # Check if the user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials")

    # Verify the password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials")

    # Create JWT token
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(minutes=30)  # Token expires after 30 minutes
    )

    return {"access_token": access_token, "token_type": "bearer"}


# Function to get the current user from the token
def get_current_user(token: str = Depends(get_db)):
    payload = verify_token(token)
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    db = next(get_db())  # Get the database session
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
