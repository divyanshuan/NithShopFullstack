import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication...");
      console.log("Token exists:", !!token);

      if (token) {
        try {
          console.log("🔐 Verifying token...");
          const response = await authAPI.verifyToken();
          console.log("✅ Token verified:", response.data.user);
          setUser(response.data.user);
        } catch (error) {
          console.error("❌ Token verification failed:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      } else {
        console.log("ℹ️ No token found");
      }

      console.log("🏁 Setting loading to false");
      setLoading(false);
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("⏰ Authentication timeout, setting loading to false");
      setLoading(false);
    }, 5000); // 5 second timeout

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [token]);

  // Login function
  const login = async (email, password, userType, propertyCode = null) => {
    try {
      console.log("🔐 Starting login process...");
      console.log("User type:", userType);
      console.log("Credentials:", { email, propertyCode });

      let credentials;
      if (userType === "admin") {
        credentials = { email, password };
      } else {
        credentials = { email, password, propertyCode };
      }

      let response;
      if (userType === "admin") {
        console.log("🔄 Calling admin login API...");
        response = await authAPI.adminLogin(credentials);
      } else {
        console.log("🔄 Calling occupant login API...");
        response = await authAPI.occupantLogin(credentials);
      }

      console.log("✅ Login response received:", response.data);
      const { token: newToken, user: userData } = response.data;

      console.log("💾 Storing token in localStorage...");
      localStorage.setItem("token", newToken);
      console.log("🔄 Updating state...");
      setToken(newToken);
      setUser(userData);

      console.log("🎉 Login successful!");
      return true;
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      console.log(
        "🔐 AuthContext: Calling changePassword API with:",
        passwordData
      );
      const response = await authAPI.changePassword(passwordData);

      // Check if the response contains new token and user data
      if (response.data.token && response.data.user) {
        console.log(
          "🔄 AuthContext: Updating token and user data after password change"
        );

        // Update the token and user state with new data
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);

        return { success: true, user: response.data.user };
      }

      return { success: true };
    } catch (error) {
      console.error("❌ AuthContext: Password change failed:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Password change failed",
      };
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data from backend...");
      const response = await authAPI.verifyToken();
      console.log("✅ User data refreshed:", response.data.user);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    changePassword,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
