import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, User, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userType, setUserType] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    propertyCode: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let credentials = {};
      if (userType === "admin") {
        credentials = {
          email: formData.email,
          password: formData.password,
        };
      } else {
        credentials = {
          propertyCode: formData.propertyCode,
          email: formData.email,
          password: formData.password,
        };
      }

      const result = await login(credentials, userType);
      if (result.success) {
        toast.success("Login successful!");
        // Navigation will be handled by the router
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to NithShop
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Management System for Shops, Booths, and Canteens
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* User Type Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType("admin")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                userType === "admin"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="inline-block w-4 h-4 mr-2" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setUserType("occupant")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                userType === "occupant"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Building2 className="inline-block w-4 h-4 mr-2" />
              Occupant
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {userType === "occupant" && (
              <div>
                <label htmlFor="propertyCode" className="form-label">
                  Property Code
                </label>
                <div className="relative">
                  <input
                    id="propertyCode"
                    name="propertyCode"
                    type="text"
                    required
                    value={formData.propertyCode}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="e.g., SH020, BT03, CN01"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

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
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

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
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner spinner-sm mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {userType === "admin"
                ? "Admin login for property management"
                : "Occupant login for property access"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
