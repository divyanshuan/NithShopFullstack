import React from "react";
import { ArrowLeft, Plus } from "lucide-react";

const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  showAdd = false,
  onBack,
  onAdd,
  addText = "Add New",
  children,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {children}
          {showAdd && (
            <button
              onClick={onAdd}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>{addText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
