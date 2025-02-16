import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import GoogleAuthButton from '../components/GoogleAuthButton';
import { EyeIcon, EyeOffIcon } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard/form");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      const result = await login({ email, password });
      if (result) {
        navigate("/dashboard/form");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-gray-50 min-h-screen flex justify-center items-center px-4 py-6">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row max-w-3xl w-full overflow-hidden">
        {/* Left Side */}
        <div className="md:w-1/2 p-6 md:p-8 lg:p-10">
          <h2 className="font-bold text-2xl md:text-3xl text-gray-800">Welcome Back</h2>
          <p className="text-sm mt-2 text-gray-600">
            If you're already a member, easily log in now.
          </p>
          
          {(error || authError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <span className="block sm:inline">{error || authError}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-[#8DD3BB] outline-none transition-all"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-[#8DD3BB] outline-none transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
           

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#8DD3BB] text-black font-medium py-3 rounded-lg hover:bg-[#14183E] hover:text-white transition-all duration-300 flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-3 text-sm text-gray-500 font-medium">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="mt-4">
            <GoogleAuthButton />
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>{" "}
            <button
              className="font-semibold text-[#8DD3BB] hover:text-[#14183E] transition-colors"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1538600838042-6a0c694ffab5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Login background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#14183E]/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;