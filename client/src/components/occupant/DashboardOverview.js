import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { occupantAPI } from "../../services/api";
import {
  Building2,
  Lock,
  EyeOff,
  User,
  Calendar,
  MapPin,
  Eye,
  Upload,
  MessageSquare,
  FileText,
  Download,
  Edit,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-hot-toast";

const DashboardOverview = () => {
  const { user, changePassword, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [adminFiles, setAdminFiles] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [occupantFiles, setOccupantFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contact: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show password change modal if first login
  useEffect(() => {
    if (user?.isFirstLogin) {
      setShowPasswordModal(true);
    } else {
      setShowPasswordModal(false);
    }
  }, [user]);

  // Initialize edit form data when user changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || "",
        contact: user.contact || "",
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await occupantAPI.getDashboard();
      setDashboardData(response.data);

      // Fetch additional data
      await Promise.all([
        fetchAdminFiles(),
        fetchCommunications(),
        fetchOccupantFiles(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminFiles = async () => {
    if (!user?.propertyId) return;

    try {
      const response = await fetch(`/api/files/property/${user.propertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only admin files
        const adminFilesList = data.files.filter(
          (file) => file.uploadedBy === "admin"
        );
        setAdminFiles(adminFilesList);
      }
    } catch (error) {
      console.error("Error fetching admin files:", error);
    }
  };

  const fetchCommunications = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/communications/occupant/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommunications(data.communications || []);
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
    }
  };

  const fetchOccupantFiles = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/files/occupant/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOccupantFiles(data.files || []);
      }
    } catch (error) {
      console.error("Error fetching occupant files:", error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);
      
      const changePasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      const result = await changePassword(changePasswordData);

      if (result.success) {
        toast.success("Password changed successfully");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
        
        // Refresh user data to get updated token
        await refreshUser();
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();

    try {
      // TODO: Implement profile update API call
      toast.success("Profile updated successfully");
      setShowEditProfile(false);

      // Refresh user data
      await refreshUser();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleCommunicationDownload = async (communicationId, fileName) => {
    try {
      const response = await fetch(
        `/api/communications/download/${communicationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleMarkAsRead = async (communicationId) => {
    try {
      const response = await fetch(
        `/api/communications/${communicationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setCommunications((prev) =>
        prev.map((comm) =>
          comm.id === communicationId ? { ...comm, status: "read" } : comm
        )
      );

      toast.success("Marked as read");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name || "Occupant"}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your property, view files, and communications
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : dashboardData ? (
        <>
          {/* Property Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Property Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Property Code
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData.property?.property_code}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Property Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData.property?.property_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contact</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.contact || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.isFirstLogin ? "First Login" : "Active"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Your Files
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {occupantFiles.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Communications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {communications.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Admin Files
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminFiles.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Files Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Files Shared by Admin
            </h2>
            {loadingFiles ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : adminFiles.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No Admin Files</p>
                <p className="text-xs">
                  No files have been shared by administrators yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {adminFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {file.fileTitle}
                          </h3>
                          {file.description && (
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="truncate">{file.fileName}</span>
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        <span>
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file.id, file.fileName)}
                      className="ml-3 p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Communications Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Communications from Admin
            </h2>
            {loadingFiles ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : communications.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No Communications</p>
                <p className="text-xs">
                  You haven't received any messages from administrators yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {communications.map((communication) => (
                  <div
                    key={communication.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      communication.status === "read"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {communication.fileTitle}
                        </h3>
                        {communication.status === "unread" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>

                      {communication.message && (
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {communication.message}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>
                          {new Date(communication.sentAt).toLocaleDateString()}
                        </span>
                        {communication.fileName && (
                          <span className="truncate">
                            File: {communication.fileName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-3">
                      {communication.status === "unread" && (
                        <button
                          onClick={() => handleMarkAsRead(communication.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {communication.fileName && (
                        <button
                          onClick={() =>
                            handleCommunicationDownload(
                              communication.id,
                              communication.fileName
                            )
                          }
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500 text-center">
            No dashboard data available
          </p>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Profile
            </h2>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={editFormData.contact}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      contact: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your contact number"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
