import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Home, Eye, EyeOff, AlertCircle, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";

const OccupantLogin = () => {
  const [formData, setFormData] = useState({
    propertyCode: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.propertyCode) {
      newErrors.propertyCode = "Property code is required";
    } else if (formData.propertyCode.length < 3) {
      newErrors.propertyCode = "Property code must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const success = await login(
        formData.email,
        formData.password,
        "occupant",
        formData.propertyCode
      );
      if (success) {
        toast.success("Welcome back!");
        navigate("/occupant");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Occupant Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your property dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Property Code Field */}
            <div>
              <label htmlFor="propertyCode" className="form-label">
                Property Code
              </label>
              <div className="relative">
                <input
                  id="propertyCode"
                  name="propertyCode"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.propertyCode}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.propertyCode
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="e.g., SHOP-A-101"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                {errors.propertyCode && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.propertyCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.propertyCode}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input pr-10 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success w-full flex justify-center items-center"
            >
              {loading ? <div className="spinner spinner-sm mr-2"></div> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-center text-sm text-gray-600 mt-4">
              Are you an admin?{" "}
              <Link
                to="/admin/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login as Admin
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">NithShop Management System</p>
        </div>
      </div>
    </div>
  );
};

export default OccupantLogin;
