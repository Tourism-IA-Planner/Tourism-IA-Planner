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

  return (
    <section className="bg-white-100 min-h-screen flex justify-center items-center">
      <div className="bg-[#ffffff] rounded-2xl flex max-w-3xl p-5 items-center">
        <div className="md:w-1/2 px-8">
          <h2 className="font-bold text-3xl text-[#000000]">Register</h2>
          <p className="text-sm mt-4 text-[#112211]">
            Discover your second country, {" "}
            <span className="text-red-500 font-bold">MORO</span>
            <span className="text-green-600 font-bold">CCO.</span>
          </p>

          {/* Error display */}
          {(authError || Object.keys(formErrors).length > 0) && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              {authError && <p className="font-bold">{authError}</p>}
              {Object.entries(formErrors).map(
                ([field, error], index) => error && <p key={index}>• {error}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <input
              className={`p-2 mt-6 rounded border ${
                formErrors.email ? "border-red-500" : ""
              }`}
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              className={`p-2 rounded border ${
                formErrors.nom ? "border-red-500" : ""
              }`}
              type="text"
              name="nom"
              placeholder="Your last name"
              value={formData.nom}
              onChange={handleChange}
            />

            <input
              className={`p-2 rounded border ${
                formErrors.prenom ? "border-red-500" : ""
              }`}
              type="text"
              name="prenom"
              placeholder="Your first name"
              value={formData.prenom}
              onChange={handleChange}
            />

            <input
              className={`p-2 rounded border w-full ${
                formErrors.password ? "border-red-500" : ""
              }`}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              className={`p-2 rounded border w-full ${
                formErrors.passwordConfirm ? "border-red-500" : ""
              }`}
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />

            <button
              className="bg-[#8DD3BB] text-black py-2 rounded hover:scale-105 duration-300 hover:bg-[#14183E] hover:text-[#FFF1DA] font-medium"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-sm flex items-center">
            <p>Already have an account?</p>
            <button
              className="register py-2 px-0.5 font-semibold text-[#8DD3BB] font-bold"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>

        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1200px] w-[900rem] max-w-full"
            src="https://images.unsplash.com/photo-1550697318-929498858774?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Signup form"
          />
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
