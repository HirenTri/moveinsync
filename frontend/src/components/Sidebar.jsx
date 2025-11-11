import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  UserCheck, 
  Settings, 
  User,
  Shield,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Define links per role with icons
  const linksByRole = {
    super_vendor: [
      { to: "/super", label: "Main Dashboard", icon: LayoutDashboard },
      { to: "/super/users", label: "Users", icon: Users },
      { to: "/super/roles", label: "Role Change", icon: UserCheck },
      { to: "/super/permissions", label: "Permissions", icon: Shield },
      { to: "/super/driver-overview", label: "Driver Overview", icon: ClipboardList },
      { to: '/super/vehicles', label: 'Manage Vehicles', icon: Truck },
      { to: "/super/profile", label: "Profile", icon: User },
    ],
    regional_vendor: [
      { to: "/regional", label: "Dashboard", icon: LayoutDashboard },
      { to: "/regional/vehicles", label: "Vehicles", icon: Truck },
      { to: "/regional/licenses", label: "Drivers", icon: Users },
      { to: "/regional/assign", label: "Assign Vehicles", icon: ClipboardList },
      { to: "/regional/profile", label: "Profile", icon: User },
    ],
    driver: [
      { to: "/driver", label: "My Profile", icon: User }
    ],
  };

  const links = linksByRole[role] || [];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                VMS Portal
              </h2>
              <p className="text-sm text-gray-300 capitalize">{role?.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:block hidden"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-300 hover:text-white hover:bg-white/10 hover:transform hover:translate-x-1"
              }`
            }
            onClick={() => setIsMobileOpen(false)}
          >
            <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
            {!isCollapsed && (
              <span className="ml-3 font-medium transition-all duration-300">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        border-r border-white/10 backdrop-blur-sm
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>

      {/* Spacer for collapsed sidebar */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`} />
    </>
  );
}
