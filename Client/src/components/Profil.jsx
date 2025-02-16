import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { useProfile } from "../contexts/ProfileContext";

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZmZmZiIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjMzLTggNHYyaDE2di0yYzAtMi42Ny01LjMzLTQtOC00eiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=`;

const Profil = () => {
  const { profile, loading, error, successMessage, updateProfile, changePassword, updateProfileImage, getProfileImage } = useProfile();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (profile) {
        setFormData({
          nom: profile.nom || "",
          prenom: profile.prenom || "",
          email: profile.email || "",
          avatar: profile.avatar || ""
        });
        
        // Load profile image
        const imageUrl = await getProfileImage();
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      }
    };
    loadProfileImage();
  }, [profile, getProfileImage]);

  const validateNom = (nom) => {
    if (nom.length < 2) return "First name must be at least 2 characters";
    if (nom.length > 30) return "First name must be less than 30 characters";
    return "";
  };

  const validatePrenom = (prenom) => {
    if (prenom.length < 2) return "Last name must be at least 2 characters";
    if (prenom.length > 30) return "Last name must be less than 30 characters";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[a-z]/.test(password)) return "Must include lowercase letter";
    if (!/[0-9]/.test(password)) return "Must include number";
    if (!/[!@#$%^&*]/.test(password)) return "Must include special character";
    return "";
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, avatar: "File size must be less than 5MB" });
          return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload image
        await updateProfileImage(file);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleProfileSave = async () => {
    const newErrors = {};

    const nomError = validateNom(formData.nom);
    if (nomError) newErrors.nom = nomError;

    const prenomError = validatePrenom(formData.prenom);
    if (prenomError) newErrors.prenom = prenomError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
  };

  const handlePasswordSave = async () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const passwordError = validatePassword(passwordData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    const success = await changePassword(passwordData);
    if (success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordDialog(false);
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div className="pt-24 text-center">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="pt-24 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="pt-24">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 mt-20 ml-[500px]">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6 bg-[#eef0ef] rounded-xl shadow-lg"
      >
        <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={imagePreview || formData.avatar || defaultAvatar}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <FaCamera className="text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </motion.div>
            {errors.avatar && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {errors.avatar}
              </motion.p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm h-12 p-4 text-xl ${
                  errors.nom ? 'border-red-500' : ''
                }`}
              />
              {errors.nom && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.nom}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm h-12 p-4 text-xl ${
                  errors.prenom ? 'border-red-500' : ''
                }`}
              />
              {errors.prenom && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.prenom}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm h-12 p-4 text-xl ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPasswordDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Change Password
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfileSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded-md font-medium ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8DD3BB] hover:bg-[#2e5245]'
              } text-white`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showPasswordDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="bg-white p-6 rounded-lg w-96"
                >
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ 
                            ...passwordData, 
                            currentPassword: e.target.value 
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ 
                            ...passwordData, 
                            newPassword: e.target.value 
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ 
                            ...passwordData, 
                            confirmPassword: e.target.value 
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setShowPasswordDialog(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordSave}
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-md ${
                        isSaving ? 'bg-gray-400' : 'bg-[#8DD3BB] hover:bg-[#2e5245]'
                      } text-white`}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Profil;