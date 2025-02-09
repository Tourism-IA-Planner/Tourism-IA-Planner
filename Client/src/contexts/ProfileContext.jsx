import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getProfileImage = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile/image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      // Si l'image n'existe pas, on retourne simplement null sans erreur
      return null;
    }
  }, [token]);

  const updateProfileImage = async (imageFile) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.put(
        `${API_URL}/user/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh profile data after image update
      await fetchProfile();
      setError(null);
      setSuccessMessage('Profile image updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/user/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setProfile(response.data);
      setError(null);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/user/password`,
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setError(null);
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail?.message || 'Password update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        successMessage,
        fetchProfile,
        updateProfile,
        changePassword,
        getProfileImage,
        updateProfileImage
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};