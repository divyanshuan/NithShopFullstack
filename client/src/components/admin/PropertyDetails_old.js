import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  FileText,
  Bell,
  User,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import PageHeader from "../common/PageHeader";

const PropertyDetails = () => {
  const { type, propertyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPropertyDetails(propertyId);
      setProperty(response.data);
    } catch (error) {
      console.error("Error fetching property details:", error);
      toast.error("Failed to load property details");
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

  if (!property) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  const currentOccupant = property.occupants?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${property.property_code} - ${property.property_type}`}
        subtitle="Property details and management"
        showBack={true}
        onBack={() => navigate(`/admin/properties/${type}`)}
      >
        <button
          onClick={() =>
            navigate(`/admin/properties/${type}/${propertyId}`, {
              state: { edit: true },
            })
          }
          className="btn btn-primary flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Occupant</span>
        </button>
      </PageHeader>

      {/* Property Overview Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Property Information</h3>
          <span
            className={`badge ${
              property.status === "Active" ? "badge-success" : "badge-danger"
            }`}
          >
            {property.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Property Code</p>
            <p className="text-lg font-semibold text-gray-900">
              {property.property_code}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Property Type</p>
            <p className="text-lg font-semibold text-gray-900">
              {property.property_type}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Created Date</p>
            <p className="text-gray-900">
              {new Date(property.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Current Occupant Card */}
      {currentOccupant && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Current Occupant</h3>
            <div className="flex items-center space-x-3">
              <span
                className={`badge ${
                  currentOccupant.status === "Active"
                    ? "badge-success"
                    : "badge-danger"
                }`}
              >
                {currentOccupant.status}
              </span>
              <button
                onClick={() => {
                  // Handle regenerate password
                  toast.success("Password regenerated successfully");
                }}
                className="btn btn-secondary btn-sm"
              >
                Regenerate Password
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentOccupant.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{currentOccupant.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contact</p>
              <p className="text-gray-900">
                {currentOccupant.contact || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Start Date</p>
              <p className="text-gray-900">
                {new Date(currentOccupant.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Login Status</p>
              <span
                className={`badge ${
                  currentOccupant.is_first_login
                    ? "badge-warning"
                    : "badge-success"
                }`}
              >
                {currentOccupant.is_first_login ? "First Login Required" : "Logged In"}
              </span>
            </div>
          </div>

          {/* Temporary Password Section */}
          {currentOccupant.is_first_login && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <h4 className="text-sm font-medium text-yellow-800">
                  Temporary Password for First Login
                </h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                The occupant needs to use this temporary password for their first login. 
                They will be prompted to change it immediately.
              </p>
              <div className="bg-white p-3 rounded border border-yellow-300">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Temporary Password:
                </p>
                <p className="text-lg font-mono font-bold text-yellow-900 bg-yellow-100 px-3 py-2 rounded">
                  {currentOccupant.tempPassword || "Generated on creation"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["overview", "documents"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.documents?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Documents</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bell className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.notifications?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Notifications</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.occupants?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Occupants</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              {property.documents && property.documents.length > 0 ? (
                <div className="space-y-3">
                  {property.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.document_type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doc.occupant?.name} •{" "}
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            window.open(
                              `/api/documents/download/${doc.id}`,
                              "_blank"
                            )
                          }
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this document?"
                              )
                            ) {
                              // Handle document deletion
                              toast.success("Document deleted");
                            }
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No documents found</p>
                </div>
              )}
            </div>
          )}



                <div className="space-y-3">
                  {property.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            notification.is_read
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {notification.is_read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
