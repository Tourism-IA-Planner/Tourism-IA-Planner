import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import GoogleAuthButton from '../components/GoogleAuthButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login({ email, password });
    if (result) {
      navigate("/dashboard/form");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <section className="bg-white-100 min-h-screen flex box-border justify-center items-center">
      <div className="bg-[#ffffff] rounded-2xl flex max-w-3xl p-5 items-center">
        {/* Left Side */}
        <div className="md:w-1/2 px-8">
          <h2 className="font-bold text-3xl text-[#000000]">Login</h2>
          <p className="text-sm mt-4 text-[#112211]">
            If you already a member, easily log in now.
          </p>
          {(error || authError) && (
            <p className="text-red-500 mt-2">{error || authError}</p>
          )}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              className="p-2 mt-6 rounded border"
              type="email"
              placeholder="Write your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                className="p-2 rounded border w-full"
                type="password"
                placeholder="Write your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#8DD3BB] text-black py-2 rounded hover:scale-105 duration-300 hover:bg-[#14183E] hover:text-[#ffffff] font-medium"
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>

          <div className="mt-6 items-center text-gray-100">
            <hr className="border-gray-300" />
            <p className="text-center text-sm text-black font-semibold">OR</p>
            <hr className="border-gray-300" />
          </div>

          <div className="mt-4">
            <GoogleAuthButton />
          </div>

          <div className="mt-4 text-sm flex items-center">
            <p className="pl-12 md:mr-0">Don't have an account?</p>
            <button
              className="register py-2 px-0.5 font-semibold text-[#8DD3BB] font-bold"
              onClick={() => navigate("/signup")}
            >
              Register
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1200px] w-[900rem] max-w-full"
            src="https://images.unsplash.com/photo-1538600838042-6a0c694ffab5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="login form"
          />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;