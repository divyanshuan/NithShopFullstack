import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Store, Coffee, Bell, Users } from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      current: location.pathname === "/admin",
    },
    {
      name: "Shops",
      href: "/admin/properties/Shop",
      icon: Store,
      current: location.pathname.includes("/properties/Shop"),
    },
    {
      name: "Booths",
      href: "/admin/properties/Booth",
      icon: Store,
      current: location.pathname.includes("/properties/Booth"),
    },
    {
      name: "Canteens",
      href: "/admin/properties/Canteen",
      icon: Coffee,
      current: location.pathname.includes("/properties/Canteen"),
    },
    {
      name: "Bulk Communication",
      href: "/admin/bulk-communication",
      icon: Users,
      current: location.pathname === "/admin/bulk-communication",
    },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive || item.current
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
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
  );
};

export default AdminSidebar;
