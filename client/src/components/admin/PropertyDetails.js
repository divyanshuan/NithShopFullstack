import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../services/api";
import { Edit, Plus, Send, Upload } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import PageHeader from "../common/PageHeader";
import FileUploadModal from "../common/FileUploadModal";
import FileList from "../common/FileList";
import CommunicationModal from "./CommunicationModal";

const PropertyDetails = () => {
  const { type, propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sendingCommunication, setSendingCommunication] = useState(false);
  const [activeTab, setActiveTab] = useState("occupant"); // Default to occupant tab

  useEffect(() => {
    fetchPropertyDetails();
    fetchFiles();
    fetchCommunications();
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

  const fetchFiles = async () => {
    try {
      console.log("🔍 Fetching files for property:", propertyId);
      const response = await fetch(`/api/files/property/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch files");
      }

      const data = await response.json();
      console.log("✅ Files response:", data);
      setFiles(data.files || []);
    } catch (error) {
      console.error("❌ Error fetching files:", error);
      toast.error(error.message || "Failed to fetch files");
    }
  };

  const fetchCommunications = async () => {
    try {
      console.log("🔍 Fetching communications for property:", propertyId);
      const response = await fetch(
        `/api/communications/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch communications");
      }

      const data = await response.json();
      console.log("✅ Communications response:", data);
      setCommunications(data.communications || []);
    } catch (error) {
      console.error("❌ Error fetching communications:", error);
      toast.error(error.message || "Failed to fetch communications");
    }
  };

  const handleFileUpload = async (uploadData) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("fileTitle", uploadData.fileTitle);
      formData.append("description", uploadData.description);
      formData.append("file", uploadData.file);
      formData.append("uploadedBy", "admin");
      formData.append("uploadedById", localStorage.getItem("adminId") || "1");

      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      toast.success("File uploaded successfully");
      fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSendCommunication = async (communicationData) => {
    setSendingCommunication(true);
    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("fileTitle", communicationData.fileTitle);
      formData.append("message", communicationData.message);
      formData.append("adminId", localStorage.getItem("adminId") || "1");

      if (communicationData.file) {
        formData.append("file", communicationData.file);
      }

      const response = await fetch("/api/communications/individual", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send communication");
      }

      toast.success("Communication sent successfully");
      fetchCommunications();
    } catch (error) {
      console.error("Communication error:", error);
      toast.error(error.message || "Failed to send communication");
      throw error;
    } finally {
      setSendingCommunication(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      console.log("🗑️ Deleting file:", fileId);
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: localStorage.getItem("adminId") || "1",
          userType: "admin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Delete failed");
      }

      toast.success("File deleted successfully");
      fetchFiles();
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error(error.message || "Failed to delete file");
      throw error;
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

  return (
    <div className="space-y-6">
      {/* <PageHeader
        title={`${property.property_type} Details`}
        subtitle={`Property Code: ${property.property_code}`}
        backUrl="/admin/properties"
      /> */}

      {/* Action Buttons in Header Line */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {property.property_type} Details
            </h2>
            <p className="text-gray-600 mt-1">
              Property Code: {property.property_code} | Status:{" "}
              {property.status}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Occupant
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setShowCommunicationModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Communication
            </button>
          </div>
        </div>
      </div>

      {/* Occupant Information */}
      {currentOccupant && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Occupant Information
            </h2>
            <button
              onClick={handleResetPassword}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Reset Password
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
              <p className="text-lg text-gray-900">{currentOccupant.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
              <p className="text-lg text-gray-900">{currentOccupant.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Contact</p>
              <p className="text-lg text-gray-900">
                {currentOccupant.contact || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Start Date
              </p>
              <p className="text-lg text-gray-900">
                {new Date(currentOccupant.start_date).toLocaleDateString()}
              </p>
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

      {/* Admin Uploaded Files Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Admin Uploaded Files
          </h2>
        </div>

        <FileList
          files={files.filter((file) => file.uploadedBy === "admin")}
          onDelete={handleDeleteFile}
          showDelete={true}
          showUploader={false}
          title=""
          emptyMessage="No admin files uploaded for this property yet."
        />
      </div>

      {/* Tabbed Section for Occupant Files and Communications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("occupant")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "occupant"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Occupant Documents
            </button>
            <button
              onClick={() => setActiveTab("communication")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "communication"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Communication Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "occupant" ? (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Files Uploaded by Occupant
              </h4>
              <FileList
                files={files.filter((file) => file.uploadedBy === "occupant")}
                onDelete={() => {}} // Occupants can't delete admin files
                showDelete={false}
                showUploader={false}
                title=""
                emptyMessage="No occupant files uploaded for this property yet."
              />
            </div>
          ) : (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Communications Sent to This Property
              </h4>
              <FileList
                files={communications.map((comm) => ({
                  id: comm.id,
                  fileTitle: comm.fileTitle,
                  description: comm.message,
                  fileName: comm.fileName,
                  fileSize: comm.fileSize,
                  uploadedBy: "admin",
                  uploadedAt: comm.sentAt,
                }))}
                onDelete={() => {}}
                showDelete={false}
                showUploader={false}
                title=""
                emptyMessage="No communications sent to this property yet."
              />
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

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleFileUpload}
        title="Upload File"
        submitText="Upload File"
        loading={uploading}
      />

      {/* Communication Modal */}
      <CommunicationModal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        onSubmit={handleSendCommunication}
        property={property}
        loading={sendingCommunication}
      />
    </div>
  );
};

export default PropertyDetails;
