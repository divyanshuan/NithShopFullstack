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
  const [authenticated, setAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const response = await authAPI.verifyToken();
          setUser(response.data.user);
          setAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("token");
          setUser(null);
          setAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second timeout

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [token]);

  // Login function
  const login = async (email, password, userType, propertyCode = null) => {
    try {
      let credentials;
      if (userType === "admin") {
        credentials = { email, password };
      } else {
        credentials = { email, password, propertyCode };
      }

      let response;
      if (userType === "admin") {
        response = await authAPI.adminLogin(credentials);
      } else {
        response = await authAPI.occupantLogin(credentials);
      }

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return true;
    } catch (error) {
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
      const response = await authAPI.changePassword(passwordData);

      // Check if the response contains new token and user data
      if (response.data.token && response.data.user) {
        // Update the token and user state with new data
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);

        return { success: true, user: response.data.user };
      }

      return { success: true };
    } catch (error) {
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
      const response = await authAPI.verifyToken();
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
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
