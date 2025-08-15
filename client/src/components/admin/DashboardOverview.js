import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../services/api";
import { Building2, Users, Store, Coffee, TrendingUp } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const propertyTypeData = dashboardData?.propertyCounts || [];
  const totalOccupants = dashboardData?.totalOccupants || 0;

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case "Shop":
        return <Store className="h-6 w-6 text-blue-600" />;
      case "Booth":
        return <Store className="h-6 w-6 text-green-600" />;
      case "Canteen":
        return <Coffee className="h-6 w-6 text-orange-600" />;
      default:
        return <Building2 className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPropertyTypeColor = (type) => {
    switch (type) {
      case "Shop":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Booth":
        return "bg-green-50 text-green-700 border-green-200";
      case "Canteen":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome to NithShop Management System</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Properties
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {propertyTypeData.reduce(
                  (sum, item) => sum + parseInt(item.count),
                  0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Total Occupants */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Occupants
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalOccupants}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Property Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {propertyTypeData.map((item) => (
          <div
            key={item.property_type}
            className={`card border-2 ${getPropertyTypeColor(
              item.property_type
            )}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.property_type}s</p>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-sm text-gray-600">
                  {item.active_count} Active
                </p>
              </div>
              <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center border">
                {getPropertyTypeIcon(item.property_type)}
              </div>
            </div>
            <button
              onClick={() =>
                navigate(`/admin/properties/${item.property_type}`)
              }
              className="mt-4 w-full btn btn-secondary text-sm"
            >
              View {item.property_type}s
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="card-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() =>
              navigate("/admin/properties/Shop", {
                state: { openAddModal: true },
              })
            }
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
          >
            <Store className="h-8 w-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Add Shop</p>
            <p className="text-sm text-gray-600">Create new shop property</p>
          </button>

          <button
            onClick={() =>
              navigate("/admin/properties/Booth", {
                state: { openAddModal: true },
              })
            }
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
          >
            <Store className="h-8 w-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Add Booth</p>
            <p className="text-sm text-gray-600">Create new booth property</p>
          </button>

          <button
            onClick={() =>
              navigate("/admin/properties/Canteen", {
                state: { openAddModal: true },
              })
            }
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
          >
            <Coffee className="h-8 w-8 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Add Canteen</p>
            <p className="text-sm text-gray-600">Create new canteen property</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
