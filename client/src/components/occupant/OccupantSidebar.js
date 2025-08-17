import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, MessageSquare, Menu, X } from "lucide-react";

const OccupantSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/occupant",
      icon: Home,
      current: location.pathname === "/occupant",
    },
    {
      name: "File Upload",
      href: "/occupant/files",
      icon: Upload,
      current: location.pathname === "/occupant/files",
    },
    {
      name: "Communications",
      href: "/occupant/communications",
      icon: MessageSquare,
      current: location.pathname === "/occupant/communications",
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      <div className="md:hidden fixed top-20 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay - only visible on mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-white shadow-lg md:shadow-sm border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        md:transition-none
        md:min-h-screen
      `}
      >
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 hidden md:block">
            Navigation
          </h2>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive || item.current
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default OccupantSidebar;
