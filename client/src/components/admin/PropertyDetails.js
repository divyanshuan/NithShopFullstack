import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../services/api";
import { Edit, Plus } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import PageHeader from "../common/PageHeader";

const PropertyDetails = () => {
  const { type, propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching property details for:", { type, propertyId });
      const response = await adminAPI.getPropertyDetails(type, propertyId);
      console.log("✅ Property details response:", response.data);

      if (response.data && response.data.property) {
        console.log("📋 Setting property data:", response.data.property);
        setProperty(response.data.property);
      } else {
        console.error("❌ Invalid response structure:", response.data);
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Error fetching property details:", error);
      console.error(
        "❌ Error details:",
        error.response?.data,
        error.response?.status
      );
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOccupant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await adminAPI.updateOccupant(type, propertyId, {
        name: formData.get("name"),
        email: formData.get("email"),
        contact: formData.get("contact"),
        startDate: formData.get("startDate"),
      });

      toast.success("Occupant details updated successfully!");
      setShowEditForm(false);
      fetchPropertyDetails();
    } catch (error) {
      console.error("Error updating occupant:", error);
      toast.error("Failed to update occupant details");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await adminAPI.resetPasswordToDefault(type, propertyId);
      toast.success(
        `Password reset to default: ${response.data.defaultPassword}`
      );
      fetchPropertyDetails();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Property not found</p>
        <button onClick={fetchPropertyDetails} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const currentOccupant = property.occupants?.[0];

  console.log("Property data:", property);
  console.log("Property code:", property.property_code);
  console.log("Property type:", property.property_type);
  console.log("Current occupant:", currentOccupant);
  console.log("Occupant status:", currentOccupant?.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${property.property_code || "Loading..."} - ${
          property.property_type || "Loading..."
        }`}
        subtitle="Property details and management"
        showBack={true}
        onBack={() => navigate(`/admin/properties/${type}`)}
      >
        <div className="flex space-x-3">
          <button
            onClick={() => {
              console.log("Edit Occupant clicked for:", property);
              // Show edit form inline
              setShowEditForm(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Occupant</span>
          </button>
        </div>
      </PageHeader>

      {/* Property and Occupant Information Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title">Current Occupant</h3>
          <button
            onClick={handleResetPassword}
            className="btn btn-secondary btn-sm flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Reset Password</span>
          </button>
        </div>

        <div className="max-w-2xl">
          {/* Occupant Information */}
          {currentOccupant && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentOccupant.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentOccupant.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Contact
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentOccupant.contact || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Start Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(currentOccupant.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Status
                  </p>
                  <span
                    className={`badge ${
                      currentOccupant.name ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {currentOccupant.name ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Login Status
                  </p>
                  <span
                    className={`badge ${
                      currentOccupant.is_first_login
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {currentOccupant.is_first_login
                      ? "First Login Required"
                      : "Logged In"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Occupant Modal */}
      {showEditForm && currentOccupant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Occupant Details
              </h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditOccupant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={currentOccupant.name}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentOccupant.email}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    defaultValue={currentOccupant.contact || ""}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={currentOccupant.start_date}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Occupant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
