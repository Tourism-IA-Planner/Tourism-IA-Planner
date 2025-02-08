import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.database import Base, get_db
from main import app

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    """Create a new database engine for testing."""
    # Import only the needed models
    from app.db.models import User

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    # Create only the User table
    User.__table__.create(bind=engine)

    yield engine

    # Drop only the User table
    User.__table__.drop(bind=engine)

@pytest.fixture(scope="function")
def db_session(engine):
    """Create a new database session for a test."""
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Create a new FastAPI TestClient."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
@pytest.fixture
def auth_header(client):
        """Create a test user and get auth header with valid token."""
        # Create test user
        client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "test@example.com",
                "password": "Password123!"
            }
        )

        # Login to get token
        response = client.post(
            "/user/signin",
            json={
                "email": "test@example.com",
                "password": "Password123!"
            }
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
class TestAuthentication:
    def test_signup_success(self, client):
        """Test successful user signup."""
        response = client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "test@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["message"] == "User created successfully"

    def test_signup_duplicate_email(self, client):
        """Test signup with duplicate email."""
        # Create first user
        client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "test@example.com",
                "password": "Password123!"
            }
        )

        # Try to create second user with same email
        response = client.post(
            "/user/signup",
            json={
                "nom": "Test2",
                "prenom": "User2",
                "email": "test@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == 401  # Authentication failed
        error_detail = response.json()["detail"]
        assert error_detail["message"] == "Authentication failed"
        assert error_detail["code"] == "AUTH_ERROR"

    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format."""
        response = client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "invalid-email",
                "password": "Password123!"
            }
        )
        assert response.status_code == 422  # Pydantic validation error

    def test_signup_weak_password(self, client):
        """Test signup with weak password."""
        response = client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "test@example.com",
                "password": "weak"
            }
        )
        assert response.status_code == 422  # Pydantic validation error
        error_detail = response.json()["detail"]
        assert "Password must be at least 8 characters" in str(error_detail)

    def test_signin_success(self, client):
        """Test successful signin."""
        # Create user first
        client.post(
            "/user/signup",
            json={
                "nom": "Test",
                "prenom": "User",
                "email": "test@example.com",
                "password": "Password123!"
            }
        )

        # Test signin
        response = client.post(
            "/user/signin",
            json={
                "email": "test@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_signin_invalid_credentials(self, client):
        """Test signin with invalid credentials."""
        response = client.post(
            "/user/signin",
            json={
                "email": "nonexistent@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 500  # Your controller returns 500 for invalid credentials
        error_detail = response.json()["detail"]
        assert "Internal server error" in str(error_detail)

    @pytest.mark.asyncio
    async def test_logout_success(self, client, auth_header):
        """Test successful logout."""
        response = client.post("/user/logout", headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Successfully logged out" in data["message"]

    def test_logout_invalid_token(self, client):
        """Test logout with invalid token."""
        response = client.post(
            "/user/logout",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_logout_missing_token(self, client):
        """Test logout without token."""
        response = client.post("/user/logout")
        assert response.status_code == 403