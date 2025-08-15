import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardOverview from "./DashboardOverview";
import PropertiesList from "./PropertiesList";
import PropertyDetails from "./PropertyDetails";

import AdminManagement from "./AdminManagement";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user needs to change password
  React.useEffect(() => {
    if (user?.isFirstLogin) {
      navigate("/change-password");
    }
  }, [user, navigate]);

  if (user?.isFirstLogin) {
    return null; // Will redirect to change password
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/properties/:type" element={<PropertiesList />} />

            <Route
              path="/properties/:type/:propertyId"
              element={<PropertyDetails />}
            />

            <Route path="/admin-management" element={<AdminManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
