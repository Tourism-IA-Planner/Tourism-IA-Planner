# import pytest
# from fastapi.testclient import TestClient
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.pool import StaticPool
# from app.db.database import Base, get_db
# from main import app
#
# import io
#
# # Use in-memory SQLite for testing
# SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
#
#
# @pytest.fixture(scope="session")
# def engine():
#     """Create a new database engine for testing."""
#     engine = create_engine(
#         SQLALCHEMY_DATABASE_URL,
#         connect_args={"check_same_thread": False},
#         poolclass=StaticPool
#     )
#     Base.metadata.create_all(bind=engine)
#     yield engine
#     Base.metadata.drop_all(bind=engine)
#
#
# @pytest.fixture(scope="function")
# def db_session(engine):
#     """Create a new database session for a test."""
#     TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
#     db = TestingSessionLocal()
#     try:
#         yield db
#     finally:
#         db.rollback()
#         db.close()
#
#
# @pytest.fixture(scope="function")
# def client(db_session):
#     """Create a new FastAPI TestClient."""
#
#     def override_get_db():
#         try:
#             yield db_session
#         finally:
#             pass
#
#     app.dependency_overrides[get_db] = override_get_db
#     with TestClient(app) as test_client:
#         yield test_client
#     app.dependency_overrides.clear()
#
#
# @pytest.fixture
# def auth_header(client):
#     """Fixture to get authorization header with valid token."""
#     # Create and login user
#     client.post(
#         "/user/signup",
#         json={
#             "nom": "Test",
#             "prenom": "User",
#             "email": "test@example.com",
#             "password": "Password123!"
#         }
#     )
#     response = client.post(
#         "/user/signin",
#         json={
#             "email": "test@example.com",
#             "password": "Password123!"
#         }
#     )
#     token = response.json()["access_token"]
#     return {"Authorization": f"Bearer {token}"}
#
#
# class TestUserProfile:
#     def test_get_profile(self, client, auth_header):
#         """Test getting user profile."""
#         response = client.get("/user/profile", headers=auth_header)
#         assert response.status_code == 200
#         data = response.json()
#         assert data["email"] == "test@example.com"
#         assert data["nom"] == "Test"
#         assert data["prenom"] == "User"
#
#     def test_get_profile_unauthorized(self, client):
#         """Test getting profile without authentication."""
#         response = client.get("/user/profile")
#         assert response.status_code == 401
#
#     def test_update_profile_success(self, client, auth_header):
#         """Test successful profile update."""
#         response = client.put(
#             "/user/profile",
#             headers=auth_header,
#             json={
#                 "nom": "Updated",
#                 "prenom": "Name",
#                 "email": "updated@example.com"
#             }
#         )
#         assert response.status_code == 200
#         data = response.json()
#         assert data["nom"] == "Updated"
#         assert data["prenom"] == "Name"
#         assert data["email"] == "updated@example.com"
#
#     def test_update_profile_invalid_email(self, client, auth_header):
#         """Test profile update with invalid email."""
#         response = client.put(
#             "/user/profile",
#             headers=auth_header,
#             json={
#                 "nom": "Test",
#                 "prenom": "User",
#                 "email": "invalid-email"
#             }
#         )
#         assert response.status_code == 400
#
#     @pytest.mark.parametrize("field,value,expected_status", [
#         ("nom", "", 400),  # Empty name
#         ("nom", "A" * 51, 400),  # Name too long
#         ("prenom", "", 400),  # Empty first name
#         ("prenom", "A" * 51, 400),  # First name too long
#         ("email", "", 400),  # Empty email
#     ])
#     def test_update_profile_validation(self, client, auth_header, field, value, expected_status):
#         """Test profile update field validation."""
#         data = {"nom": "Test", "prenom": "User", "email": "test@example.com"}
#         data[field] = value
#         response = client.put("/user/profile", headers=auth_header, json=data)
#         assert response.status_code == expected_status
#
#     def test_update_profile_image_success(self, client, auth_header):
#         """Test successful profile image update."""
#         # Create a test image
#         test_image = io.BytesIO(b"fake image content")
#         files = {"image": ("test.jpg", test_image, "image/jpeg")}
#
#         response = client.put(
#             "/user/profile/image",
#             headers=auth_header,
#             files=files
#         )
#         assert response.status_code == 200
#
#     def test_update_profile_image_invalid_type(self, client, auth_header):
#         """Test profile image update with invalid file type."""
#         test_file = io.BytesIO(b"fake file content")
#         files = {"image": ("test.txt", test_file, "text/plain")}
#
#         response = client.put(
#             "/user/profile/image",
#             headers=auth_header,
#             files=files
#         )
#         assert response.status_code == 400
#
#     def test_update_profile_image_too_large(self, client, auth_header):
#         """Test profile image update with file too large."""
#         large_image = io.BytesIO(b"0" * (5 * 1024 * 1024 + 1))  # 5MB + 1 byte
#         files = {"image": ("large.jpg", large_image, "image/jpeg")}
#
#         response = client.put(
#             "/user/profile/image",
#             headers=auth_header,
#             files=files
#         )
#         assert response.status_code == 400
#
#     def test_get_profile_image_no_image(self, client, auth_header):
#         """Test getting profile image when none exists."""
#         response = client.get("/user/profile/image", headers=auth_header)
#         assert response.status_code == 404
#
#     def test_update_password_success(self, client, auth_header):
#         """Test successful password update."""
#         response = client.put(
#             "/user/password",
#             headers=auth_header,
#             json={
#                 "current_password": "Password123!",
#                 "new_password": "NewPassword123!",
#                 "confirm_password": "NewPassword123!"
#             }
#         )
#         assert response.status_code == 200
#         assert response.json()["message"] == "Password updated successfully"
#
#     def test_update_password_incorrect_current(self, client, auth_header):
#         """Test password update with incorrect current password."""
#         response = client.put(
#             "/user/password",
#             headers=auth_header,
#             json={
#                 "current_password": "WrongPassword123!",
#                 "new_password": "NewPassword123!",
#                 "confirm_password": "NewPassword123!"
#             }
#         )
#         assert response.status_code == 400
#
#     def test_update_password_mismatch(self, client, auth_header):
#         """Test password update with mismatched new passwords."""
#         response = client.put(
#             "/user/password",
#             headers=auth_header,
#             json={
#                 "current_password": "Password123!",
#                 "new_password": "NewPassword123!",
#                 "confirm_password": "DifferentPassword123!"
#             }
#         )
#         assert response.status_code == 400
#
#     @pytest.mark.parametrize("password,expected_status", [
#         ("short", 400),  # Too short
#         ("nouppercasepass1!", 400),  # No uppercase
#         ("NOLOWERCASEPASS1!", 400),  # No lowercase
#         ("NoSpecialChar123", 400),  # No special character
#         ("NoNumber!", 400),  # No number
#     ])
#     def test_update_password_validation(self, client, auth_header, password, expected_status):
#         """Test password update validation rules."""
#         response = client.put(
#             "/user/password",
#             headers=auth_header,
#             json={
#                 "current_password": "Password123!",
#                 "new_password": password,
#                 "confirm_password": password
#             }
#         )
#         assert response.status_code == expected_status