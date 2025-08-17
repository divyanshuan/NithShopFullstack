import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle, Send } from "lucide-react";
import { toast } from "react-hot-toast";

const CommunicationModal = ({
  isOpen,
  onClose,
  onSubmit,
  property,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    fileTitle: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed");
        setSelectedFile(null);
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size must be less than 10MB");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fileTitle.trim()) {
      toast.error("Please enter a file title");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        file: selectedFile,
      });

      // Reset form
      setFormData({ fileTitle: "", message: "" });
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Communication error:", error);
    }
  };

  const handleClose = () => {
    setFormData({ fileTitle: "", message: "" });
    setSelectedFile(null);
    setFileError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Send Communication
            </h2>
            {property && (
              <p className="text-sm text-gray-600 mt-1">
                To: {property.property_code} ({property.property_type})
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is this file? *
            </label>
            <input
              type="text"
              value={formData.fileTitle}
              onChange={(e) =>
                setFormData({ ...formData, fileTitle: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter file title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your message"
              rows={3}
              required
            />
          </div>

          {/* File Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select PDF file (optional)"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Max size: 10MB
                </span>
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span>{selectedFile.name}</span>
                <span className="ml-2 text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}

            {/* File Error */}
            {fileError && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={
                loading ||
                !formData.fileTitle.trim() ||
                !formData.message.trim()
              }
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunicationModal;
