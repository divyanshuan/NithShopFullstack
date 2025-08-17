import React from "react";
import {
  FileText,
  Download,
  Trash2,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const FileList = ({
  files,
  onDelete,
  showDelete = false,
  showUploader = true,
  title = "Files",
  emptyMessage = "No files uploaded yet",
}) => {
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`, {
        method: "GET",
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

  const handleDelete = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await onDelete(fileId);
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete file");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUploaderIcon = (uploadedBy) => {
    return uploadedBy === "admin" ? (
      <User className="w-4 h-4 text-blue-600" />
    ) : (
      <User className="w-4 h-4 text-green-600" />
    );
  };

  const getUploaderText = (uploadedBy) => {
    return uploadedBy === "admin" ? "Admin" : "Occupant";
  };

  if (!files || files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div> */}

      <div className="divide-y divide-gray-200">
        {files.map((file) => (
          <div
            key={file.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.fileTitle}
                    </h4>
                    {file.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>Size:</span>
                    <span className="font-medium">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>

                  {showUploader && (
                    <div className="flex items-center space-x-1">
                      {getUploaderIcon(file.uploadedBy)}
                      <span>{getUploaderText(file.uploadedBy)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDownload(file.id, file.fileName)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>

                {showDelete && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
