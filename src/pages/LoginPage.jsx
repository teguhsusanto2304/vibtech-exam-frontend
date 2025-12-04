import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const togglePassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/logo`);
        if (response.data.success && response.data.data.logo) {
          setLogoUrl(`${API_BASE_URL.replace('/api', '')}${response.data.data.logo}`);
          localStorage.setItem("logoUrl",`${API_BASE_URL.replace('/api', '')}${response.data.data.logo}`);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  // ✅ API Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 Example endpoint: adjust URL for your real API
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      // 🔹 Assuming response.data contains token or user info
      if (response.data?.token) {
        // Store token in localStorage
        localStorage.setItem("authToken", response.data.token);
        // Redirect to exam page
        navigate("/exam");
      } else {
        setError(`Invalid credentials. Please try again.`);
      }
    } catch (err) {
      // 🔹 Handle API or network errors
      if (err.response?.status === 401 || err.response?.status === 402 || err.response?.status === 403 || err.response?.status === 404) {
        setError(err.response?.data.message);
      } else if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to server. Please check your network.");
      } else {
        setError(`Login failed. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col w-full max-w-md px-4 py-5">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
            {!loading && logoUrl && (
          <img src={logoUrl} alt="Logo" className="login-logo" />
        )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3 p-4 text-center">
          <p className="text-4xl font-black leading-tight tracking-[-0.033em]">
            Vibtech Genesis Examination Portal
          </p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
            Welcome back. Please log in to continue.
          </p>
        </div>
        {/* Error Message */}
          {error && (
            <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
              <p class="font-bold">Be Warned</p>
              <p>{error}</p>
            </div>
          )}
        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 mt-6"
        >
          {/* Email */}
          <div className="py-3">
            <label className="block text-base font-medium pb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 h-14 p-3 text-base focus:border-primary focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="py-3">
            <label className="block text-base font-medium pb-2">
              Password
            </label>
            <div className="flex items-stretch rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 rounded-l-lg bg-transparent h-14 p-3 text-base focus:outline-none"
              />
              <button
  type="button"
  onClick={togglePassword}
  className="px-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700 
  border border-gray-300 dark:border-gray-500 rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-600"
>
  <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">
    {showPassword ? "visibility_off" : "visibility"}
  </span>
</button>

            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
  type="submit"
  disabled={loading}
  className={`w-full h-12 mt-4 font-bold text-white rounded-lg transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-primary hover:bg-opacity-90"
  }`}
>
  {loading ? "Logging in..." : "Login"}
</button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <a href="#" className="hover:underline">
            Support
          </a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
