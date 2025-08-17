import React, { useState } from "react";
import { Upload, FileText, AlertCircle, Send, Users } from "lucide-react";
import { toast } from "react-hot-toast";

const BulkCommunicationTab = () => {
  const [formData, setFormData] = useState({
    recipientType: "all_properties",
    fileTitle: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  const recipientTypes = [
    {
      value: "all_properties",
      label: "All Properties",
      description: "Send to all shops, booths, and canteens",
    },
    {
      value: "all_shops",
      label: "All Shops",
      description: "Send to all shop properties only",
    },
    {
      value: "all_booths",
      label: "All Booths",
      description: "Send to all booth properties only",
    },
    {
      value: "all_canteens",
      label: "All Canteens",
      description: "Send to all canteen properties only",
    },
  ];

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

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("recipientType", formData.recipientType);
      formDataToSend.append("fileTitle", formData.fileTitle);
      formDataToSend.append("message", formData.message);
      formDataToSend.append("adminId", localStorage.getItem("adminId") || "1"); // Get from auth context

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const response = await fetch("/api/communications/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to send communication");
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset form
      setFormData({
        recipientType: "all_properties",
        fileTitle: "",
        message: "",
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Communication error:", error);
      toast.error("Failed to send communication");
    } finally {
      setLoading(false);
    }
  };

  const getRecipientTypeInfo = () => {
    const type = recipientTypes.find((t) => t.value === formData.recipientType);
    return type || recipientTypes[0];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Send Communication to All
          </h2>
        </div>
        <p className="text-gray-600">
          Send files and messages to multiple properties at once. Choose the
          recipient type and compose your communication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Recipients *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipientTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.recipientType === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="recipientType"
                  value={type.value}
                  checked={formData.recipientType === type.value}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientType: e.target.value })
                  }
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p
                        className={`font-medium ${
                          formData.recipientType === type.value
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        {type.label}
                      </p>
                      <p
                        className={`${
                          formData.recipientType === type.value
                            ? "text-blue-700"
                            : "text-gray-500"
                        }`}
                      >
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 ${
                      formData.recipientType === type.value
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

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
            placeholder="Enter your message to all recipients"
            rows={4}
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
              <span className="text-xs text-gray-500 mt-1">Max size: 10MB</span>
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

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Communication Summary
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                This communication will be sent to{" "}
                <strong>{getRecipientTypeInfo().label}</strong>.
                {formData.fileTitle && (
                  <>
                    <br />
                    <strong>Title:</strong> {formData.fileTitle}
                  </>
                )}
                {formData.message && (
                  <>
                    <br />
                    <strong>Message:</strong>{" "}
                    {formData.message.substring(0, 100)}
                    {formData.message.length > 100 && "..."}
                  </>
                )}
                {selectedFile && (
                  <>
                    <br />
                    <strong>File:</strong> {selectedFile.name}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            disabled={
              loading || !formData.fileTitle.trim() || !formData.message.trim()
            }
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Communication to All</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkCommunicationTab;
