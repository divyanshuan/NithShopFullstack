import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../services/api";
import { Plus, Eye, Edit, Search, Filter, Building2, Save } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import PageHeader from "../common/PageHeader";

const PropertiesList = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    propertyType: type || "Shop", // Default to Shop if type is undefined
    propertyCode: "",
    occupantName: "",
    occupantEmail: "",
    occupantContact: "",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [addingProperty, setAddingProperty] = useState(false);

  useEffect(() => {
    if (type) {
      fetchProperties();
    }
  }, [type, currentPage]);

  // Update form data when page type changes
  useEffect(() => {
    if (type) {
      console.log("🔄 Page type changed to:", type);
      setAddFormData((prev) => ({
        ...prev,
        propertyType: type,
      }));
    }
  }, [type]);

  // Check if modal should be opened automatically from dashboard navigation
  useEffect(() => {
    if (location.state?.openAddModal) {
      console.log("Opening add modal automatically from dashboard navigation");
      setShowAddModal(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Safety check for type parameter - moved after all hooks
  if (!type) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invalid property type</p>
      </div>
    );
  }

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching properties for type:", type);

      if (!type) {
        console.error("❌ Type parameter is undefined");
        return;
      }

      const response = await adminAPI.getPropertiesByType(
        type,
        currentPage,
        10
      );

      console.log("✅ Properties response:", response.data);

      if (response.data && response.data.properties) {
        setProperties(response.data.properties);
        setPagination(response.data.pagination || {});
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.warn("⚠️ No properties data in response");
        setProperties([]);
        setPagination({});
        setTotalPages(1);
      }
    } catch (error) {
      console.error("❌ Error fetching properties:", error);
      toast.error("Failed to load properties");
      setProperties([]);
      setPagination({});
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    if (!property) return false;

    const propertyCode = property.property_code || "";
    const occupantName = property.occupants?.[0]?.name || "";
    const occupantEmail = property.occupants?.[0]?.email || "";

    const searchLower = searchTerm.toLowerCase();

    return (
      propertyCode.toLowerCase().includes(searchLower) ||
      occupantName.toLowerCase().includes(searchLower) ||
      occupantEmail.toLowerCase().includes(searchLower)
    );
  });

  const getPropertyTypeColor = (propertyType) => {
    switch (propertyType) {
      case "Shop":
        return "bg-blue-100 text-blue-800";
      case "Booth":
        return "bg-green-100 text-green-800";
      case "Canteen":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setAddingProperty(true);

    // Always use the current page type, not the form data
    const propertyData = {
      ...addFormData,
      propertyType: type, // Force use current page type
    };

    console.log("🚀 Creating property with data:", propertyData);
    console.log("📄 Current page type:", type);
    console.log("🏢 Property type being sent:", propertyData.propertyType);

    try {
      const response = await adminAPI.addProperty(propertyData);
      toast.success("Property and occupant created successfully!");

      // Show default password info
      toast.success(
        `Default password for ${response.data.occupant.name}: nith@123`,
        { duration: 10000 }
      );

      // Reset form and close modal
      setAddFormData({
        propertyType: type,
        propertyCode: "",
        occupantName: "",
        occupantEmail: "",
        occupantContact: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      setShowAddModal(false);

      // Refresh properties list
      fetchProperties();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error(error.response?.data?.error || "Failed to create property");
    } finally {
      setAddingProperty(false);
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      propertyType: type,
      propertyCode: "",
      occupantName: "",
      occupantEmail: "",
      occupantContact: "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${type}s`}
        subtitle={`Manage ${type.toLowerCase()} properties and occupants`}
        showAdd={true}
        addText={`Add ${type}`}
        onAdd={() => setShowAddModal(true)}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type.toLowerCase()}s by code, name, or email...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Property Code</th>
                <th>Type</th>
                <th>Occupant Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No {type ? type.toLowerCase() : "properties"} found
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => {
                  const occupant = property.occupants?.[0];
                  return (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="font-medium text-primary-600">
                        <button
                          onClick={() =>
                            navigate(`/admin/properties/${type}/${property.id}`)
                          }
                          className="hover:underline cursor-pointer"
                        >
                          {property.property_code}
                        </button>
                      </td>
                      <td>
                        <span
                          className={`badge ${getPropertyTypeColor(
                            property.property_type
                          )}`}
                        >
                          {property.property_type}
                        </span>
                      </td>
                      <td>{occupant?.name || "No occupant"}</td>
                      <td>{occupant?.email || "-"}</td>
                      <td>{occupant?.contact || "-"}</td>
                      <td>
                        {occupant?.start_date
                          ? new Date(occupant.start_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/properties/${type}/${property.id}`
                              )
                            }
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/properties/${type}/${property.id}`,
                                { state: { edit: true } }
                              )
                            }
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Edit Occupant"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Add New {type}
              </h3>
              <button
                onClick={resetAddForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-6">
              {/* Property Code */}
              <div>
                <label htmlFor="propertyCode" className="form-label">
                  Property Code
                </label>
                <input
                  id="propertyCode"
                  name="propertyCode"
                  type="text"
                  required
                  value={addFormData.propertyCode}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., SH01, BT01, CN01"
                />
              </div>

              {/* Occupant Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Occupant Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="occupantName" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="occupantName"
                      name="occupantName"
                      type="text"
                      required
                      value={addFormData.occupantName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter occupant's full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="occupantEmail" className="form-label">
                      Email Address
                    </label>
                    <input
                      id="occupantEmail"
                      name="occupantEmail"
                      type="email"
                      required
                      value={addFormData.occupantEmail}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter occupant's email"
                    />
                  </div>
                  <div>
                    <label htmlFor="occupantContact" className="form-label">
                      Contact Number
                    </label>
                    <input
                      id="occupantContact"
                      name="occupantContact"
                      type="tel"
                      value={addFormData.occupantContact}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter contact number (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="startDate" className="form-label">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      value={addFormData.startDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Important Note
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      A default password (nith@123) will be set for the new
                      occupant. They will be required to change it on their
                      first login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProperty}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {addingProperty ? (
                    <>
                      <div className="spinner spinner-sm"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create {type}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesList;
