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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <LoadingOverlay isLoading={isLoading} message="Loading dashboard...">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                Platform Operations Center
              </h1>
              <p className="text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-teal-400" />
                Last status check: {currentTime}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="animate-fade-in bg-red-500/20 border border-red-500/50 text-red-200">
              <p>{error}</p>
            </Alert>
          )}

          {stats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={<Users2 className="w-8 h-8 text-teal-400" />}
                  title="Platform Users"
                  value={stats.total_users || 0}
                  description="Total registered accounts"
                  color="teal"
                  trend="+12%"
                />

                <MetricCard
                  icon={<Truck className="w-8 h-8 text-teal-400" />}
                  title="Active Drivers"
                  value={stats.total_drivers || 0}
                  description="Operational personnel"
                  color="teal"
                  trend="+8%"
                />

                <MetricCard
                  icon={<Shield className="w-8 h-8 text-teal-400" />}
                  title="Partner Branches"
                  value={stats.regional_vendors || 0}
                  description="Regional operations"
                  color="teal"
                  trend="+5%"
                />

                <MetricCard
                  icon={<MapPin className="w-8 h-8 text-teal-400" />}
                  title="Service Regions"
                  value={5}
                  description="Geographic coverage"
                  color="teal"
                  trend="Stable"
                />
              </div>

              {/* Additional Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="flex items-center text-lg font-bold text-white mb-6">
                    <BarChart3 className="w-5 h-5 mr-2 text-teal-400" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">Platform Status</span>
                      </div>
                      <span className="text-green-400 font-medium">Healthy</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                        <span className="text-gray-300">Data Backend</span>
                      </div>
                      <span className="text-teal-400 font-medium">Synchronized</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300">Pending Operations</span>
                      </div>
                      <span className="text-yellow-400 font-medium">2 Tasks</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="flex items-center text-lg font-bold text-white mb-6">
                    <Activity className="w-5 h-5 mr-2 text-teal-400" />
                    Latest Events
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <p className="text-gray-300">Driver registration processed</p>
                        <p className="text-gray-500">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <p className="text-gray-300">Vehicle deployed</p>
                        <p className="text-gray-500">4 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <p className="text-gray-300">Partner onboarded</p>
                        <p className="text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
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
    teal: "from-teal-500/10 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50",
    blue: "from-blue-500/10 to-blue-600/10 border-blue-500/30",
    green: "from-green-500/10 to-green-600/10 border-green-500/30",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-500/30",
    orange: "from-orange-500/10 to-orange-600/10 border-orange-500/30",
  };

  const trendColors = {
    teal: "text-teal-400",
    blue: "text-blue-400",
    green: "text-green-400", 
    purple: "text-purple-400",
    orange: "text-orange-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-lg`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-medium text-gray-300">{title}</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${trendColors[color]}`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
