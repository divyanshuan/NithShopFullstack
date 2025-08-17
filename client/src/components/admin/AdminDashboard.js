import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import DashboardOverview from "./DashboardOverview";
import PropertiesList from "./PropertiesList";
import PropertyDetails from "./PropertyDetails";
import BulkCommunicationTab from "./BulkCommunicationTab";

const AdminDashboard = () => {
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
            <Route
              path="/bulk-communication"
              element={<BulkCommunicationTab />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
