import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import OccupantSidebar from "./OccupantSidebar";
import OccupantHeader from "./OccupantHeader";
import DashboardOverview from "./DashboardOverview";

const OccupantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug: Show user info
  console.log("OccupantDashboard - User:", user);
  console.log("OccupantDashboard - isFirstLogin:", user?.isFirstLogin);

  return (
    <div className="min-h-screen bg-gray-50">
      <OccupantHeader />
      <div className="flex">
        <OccupantSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OccupantDashboard;
