// src/pages/SuperVendorDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { LoadingOverlay } from "../components/ui/Loading.jsx";
import { 
  Users2, 
  Truck, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  MapPin,
  Shield,
  Clock
} from "lucide-react";

export default function SuperVendorDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/stats/super");
        setStats(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentTime = new Date().toLocaleString();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <LoadingOverlay isLoading={isLoading} message="Loading dashboard...">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Super Vendor Dashboard
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Last updated: {currentTime}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Activity className="w-4 h-4 text-green-500" />
                <span>System Online</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="animate-fade-in">
              <p>{error}</p>
            </Alert>
          )}

          {stats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={<Users2 className="w-8 h-8 text-blue-500" />}
                  title="Total Users"
                  value={stats.total_users || 0}
                  description="Registered users"
                  color="blue"
                  trend="+12%"
                />

                <MetricCard
                  icon={<Truck className="w-8 h-8 text-green-500" />}
                  title="Total Drivers"
                  value={stats.total_drivers || 0}
                  description="Active drivers"
                  color="green"
                  trend="+8%"
                />

                <MetricCard
                  icon={<Shield className="w-8 h-8 text-purple-500" />}
                  title="Regional Vendors"
                  value={stats.regional_vendors || 0}
                  description="Regional partners"
                  color="purple"
                  trend="+5%"
                />

                <MetricCard
                  icon={<MapPin className="w-8 h-8 text-orange-500" />}
                  title="Active Regions"
                  value={5}
                  description="Coverage areas"
                  color="orange"
                  trend="Stable"
                />
              </div>

              {/* Additional Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card variant="gradient" className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-gray-700">System Status</span>
                        </div>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-700">Database</span>
                        </div>
                        <span className="text-blue-600 font-medium">Connected</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-700">Pending Reviews</span>
                        </div>
                        <span className="text-yellow-600 font-medium">2 Items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-green-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <p className="text-gray-700">New driver registered</p>
                          <p className="text-gray-500">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <p className="text-gray-700">Vehicle assigned</p>
                          <p className="text-gray-500">4 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <p className="text-gray-700">New regional vendor</p>
                          <p className="text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </LoadingOverlay>
      </main>
    </div>
  );
}

function MetricCard({ icon, title, value, description, color, trend }) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
  };

  const trendColors = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {icon}
              <h3 className="font-medium text-gray-700">{title}</h3>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${trendColors[color]}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
