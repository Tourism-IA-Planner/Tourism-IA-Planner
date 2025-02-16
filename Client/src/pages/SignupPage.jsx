import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error: authError } = useContext(AuthContext);

  // Local states
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error if the user corrects the field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const isValidName = (name) => {
      // Check for dots and special characters
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
      return nameRegex.test(name) && !name.includes(".");
    };

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email";
    }

    // Last name validation
    if (!formData.nom) {
      errors.nom = "Last name is required";
    } else if (!isValidName(formData.nom)) {
      errors.nom = "Last name contains invalid characters";
    }

    // First name validation
    if (!formData.prenom) {
      errors.prenom = "First name is required";
    } else if (!isValidName(formData.prenom)) {
      errors.prenom = "First name contains invalid characters";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    // Password confirmation validation
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const { passwordConfirm, ...signupData } = formData; // Remove passwordConfirm

      const result = await signup(signupData);

      if (result) {
        navigate("/login"); // Redirect after success
      }
    }
  };

  const renderErrors = () => {
    if (!authError && Object.keys(formErrors).length === 0) return null;
    
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4"
        role="alert"
      >
        {authError && <p className="font-bold">{authError}</p>}
        {Object.entries(formErrors).map(
          ([field, error], index) => error && <p key={index} className="text-sm">• {error}</p>
        )}
      </div>
    );
  };

  return (
    <section className="bg-[#F9F9F9] min-h-screen flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row max-w-3xl w-full overflow-hidden">
        {/* Form Column */}
        <div className="md:w-1/2 w-full px-6 py-8 md:px-8">
          <h2 className="font-bold text-2xl md:text-3xl text-[#112211]">Register</h2>
          <p className="text-sm mt-2 text-[#112211]">
            Discover your second country,{" "}
            <span className="text-red-500 font-bold">MORO</span>
            <span className="text-green-600 font-bold">CCO.</span>
          </p>

          {renderErrors()}

          <form onSubmit={handleSignup} className="flex flex-col gap-3 mt-6">
            <div className="space-y-1">
              <input
                className={`p-2.5 w-full rounded-md border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#8DD3BB]`}
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                className={`p-2.5 w-full rounded-md border ${
                  formErrors.prenom ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#8DD3BB]`}
                type="text"
                name="prenom"
                placeholder="Your first name"
                value={formData.prenom}
                onChange={handleChange}
                aria-label="First name"
              />
              {formErrors.prenom && (
                <p className="text-red-500 text-xs">{formErrors.prenom}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                className={`p-2.5 w-full rounded-md border ${
                  formErrors.nom ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#8DD3BB]`}
                type="text"
                name="nom"
                placeholder="Your last name"
                value={formData.nom}
                onChange={handleChange}
                aria-label="Last name"
              />
              {formErrors.nom && (
                <p className="text-red-500 text-xs">{formErrors.nom}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                className={`p-2.5 w-full rounded-md border ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#8DD3BB]`}
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                aria-label="Password"
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                className={`p-2.5 w-full rounded-md border ${
                  formErrors.passwordConfirm ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#8DD3BB]`}
                type="password"
                name="passwordConfirm"
                placeholder="Confirm password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                aria-label="Confirm password"
              />
              {formErrors.passwordConfirm && (
                <p className="text-red-500 text-xs">{formErrors.passwordConfirm}</p>
              )}
            </div>

            <button
              className="bg-[#8DD3BB] text-black py-3 rounded-md hover:bg-[#14183E] hover:text-white transition-all duration-300 font-medium mt-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DD3BB]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-4 text-sm flex items-center justify-center md:justify-start">
            <p className="text-gray-600">Already have an account?</p>
            <button
              className="ml-1 font-semibold text-[#8DD3BB] hover:underline focus:outline-none"
              onClick={() => navigate("/login")}
              type="button"
            >
              Login
            </button>
          </div>
        </div>

        {/* Image Column */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1550697318-929498858774?fm=jpg&q=60&w=2000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Morocco landscape"
          />
        </div>
      </div>
    </section>
  );
};

export default SignupPage;