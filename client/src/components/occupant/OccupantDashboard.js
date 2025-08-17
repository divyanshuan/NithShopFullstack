import React from "react";
import { Routes, Route } from "react-router-dom";
import OccupantHeader from "./OccupantHeader";
import OccupantSidebar from "./OccupantSidebar";
import DashboardOverview from "./DashboardOverview";
import FileUploadTab from "./FileUploadTab";
import CommunicationTab from "./CommunicationTab";

const OccupantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OccupantHeader />
      <div className="flex">
        <OccupantSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/files" element={<FileUploadTab />} />
            <Route path="/communications" element={<CommunicationTab />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OccupantDashboard;
