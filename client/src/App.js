import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginSelection from "./components/auth/LoginSelection";
import AdminLogin from "./components/auth/AdminLogin";
import OccupantLogin from "./components/auth/OccupantLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import OccupantDashboard from "./components/occupant/OccupantDashboard";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  console.log("🔄 AppRoutes - Loading:", loading, "User:", user);

  if (loading) {
    console.log("⏳ Showing loading spinner...");
    return <LoadingSpinner />;
  }

  // Routes for non-logged in users
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LoginSelection />} />
        <Route path="/login" element={<LoginSelection />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/occupant/login" element={<OccupantLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Routes for logged-in users
  return (
    <Routes>
      <Route
        path="/"
        element={
          user.role === "admin" || user.role === "Super Admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/occupant" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          user.role === "admin" || user.role === "Super Admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/occupant" replace />
          )
        }
      />

      <Route
        path="/admin/login"
        element={
          user.role === "admin" || user.role === "Super Admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/occupant" replace />
          )
        }
      />

      <Route
        path="/occupant/login"
        element={
          user.role === "admin" || user.role === "Super Admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/occupant" replace />
          )
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "Super Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/occupant/*"
        element={
          <ProtectedRoute allowedRoles={["occupant"]}>
            <OccupantDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
