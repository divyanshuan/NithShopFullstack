import React, { useState, useEffect } from "react";
import { Plus, Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import FileUploadModal from "../common/FileUploadModal";
import FileList from "../common/FileList";

const FileUploadTab = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/files/occupant/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (uploadData) => {
    setUploading(true);
    try {
      console.log("🔍 User object:", user);
      console.log("🔍 Upload data:", uploadData);

      const formData = new FormData();
      formData.append("propertyId", user.propertyId); // Changed from property_id to propertyId
      formData.append("fileTitle", uploadData.fileTitle);
      formData.append("description", uploadData.description);
      formData.append("file", uploadData.file);
      formData.append("uploadedBy", "occupant");
      formData.append("uploadedById", user.id);

      console.log("🔍 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type for FormData - let browser handle it
        },
        body: formData,
      });

      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("🔍 Error response:", errorData);
        throw new Error(
          errorData.message || `Upload failed: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("🔍 Success response:", result);
      toast.success("File uploaded successfully");

      // Refresh file list
      fetchFiles();
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(error.message || "Failed to upload file");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Delete failed");
      }

      toast.success("File deleted successfully");
      fetchFiles(); // Refresh the files list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete file");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
            <p className="text-gray-600 mt-1">
              Upload and manage your property-related files
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload New File
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Uploaded Files
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No files uploaded yet</p>
                <p className="text-xs">
                  Click 'Upload New File' to get started.
                </p>
              </div>
            ) : (
              files.map((file) => (
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
                  <div className="flex items-center space-x-1 ml-3">
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUpload}
        title="Upload New File"
        submitText="Upload File"
        loading={uploading}
      />
    </div>
  );
};

export default FileUploadTab;
