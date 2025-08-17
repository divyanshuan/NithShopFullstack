import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  FileText,
  Download,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const CommunicationTab = () => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/communications/occupant/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch communications");
      }

      const data = await response.json();
      setCommunications(data.communications || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
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

  const handleDownload = async (communicationId, fileName) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    return status === "read" ? (
      <Eye className="w-4 h-4 text-green-600" />
    ) : (
      <EyeOff className="w-4 h-4 text-gray-400" />
    );
  };

  const getStatusText = (status) => {
    return status === "read" ? "Read" : "Unread";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-1">
              View messages and files sent by administrators
            </p>
          </div>
        </div>
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Received Messages</h2>
        
        {loading ? (
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
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
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
                      onClick={() => handleDownload(communication.id, communication.fileName)}
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
    </div>
  );
};

export default CommunicationTab;
