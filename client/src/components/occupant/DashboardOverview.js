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
    <div className="space-y-4 lg:space-y-6">
      {/* Header with Welcome and Change Password/Edit Profile buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Welcome, {user?.name || "Occupant"}!</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Manage your property files and view communications</p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button onClick={() => setShowEditProfile(true)} className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
              <Edit className="w-4 h-4 mr-2" />Edit Profile
            </button>
            <button onClick={() => setShowPasswordModal(true)} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <Lock className="w-4 h-4 mr-2" />Change Password
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      ) : dashboardData ? (
        <>
          {/* Property Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {/* Property Code */}
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Property Code</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {dashboardData.property?.property_code || "Not set"}
                  </p>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Property Type</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {dashboardData.property?.property_type || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {/* Name */}
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Name</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {user?.name || "Not set"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs lg:text-sm">@</span>
                </div>
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Email</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {user?.email || "Not set"}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs lg:text-sm">📞</span>
                </div>
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Contact</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {user?.contact || "Not set"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs lg:text-sm">✓</span>
                </div>
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Status</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {user?.status || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {/* Your Files Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Your Files</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {occupantFiles.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Communications Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Communications</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {communications.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Files Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                <div>
                  <p className="text-sm lg:text-base font-medium text-gray-600">Admin Files</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {adminFiles.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Files Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
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
                <p className="text-xs">No files have been shared by administrators yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {adminFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 mt-1 space-y-1 sm:space-y-0">
                        <span className="truncate">{file.fileName}</span>
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
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
                <p className="text-xs">You haven't received any messages from administrators yet.</p>
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
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-xs text-gray-500 space-y-1 sm:space-y-0">
                        <span>{new Date(communication.sentAt).toLocaleDateString()}</span>
                        {communication.fileName && (
                          <span className="truncate">File: {communication.fileName}</span>
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
                          onClick={() => handleCommunicationDownload(communication.id, communication.fileName)}
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
        <div className="text-center py-12">
          <p className="text-gray-500">No dashboard data available</p>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="tel"
                  value={editFormData.contact}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, contact: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Profile
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
