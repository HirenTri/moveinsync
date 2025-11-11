import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { LoadingOverlay } from '../components/ui/Loading.jsx';
import { 
  Users, 
  Truck, 
  User, 
  Database, 
  MapPin,
  Activity,
  Clock,
  Shield,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function RegionalVendorDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/region/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.msg || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentTime = new Date().toLocaleString();

  const cards = stats ? [
    {
      label: 'Personnel',
      value: stats.totalDrivers || 0,
      icon: <Users className="w-8 h-8 text-teal-400" />,
      color: 'teal',
      trend: '+5%',
      description: 'Staff on file'
    },
    {
      label: 'Fleet Size',
      value: stats.totalVehicles || 0,
      icon: <Truck className="w-8 h-8 text-teal-400" />,
      color: 'teal',
      trend: '+8%',
      description: 'Total vehicles'
    },
    {
      label: 'Deployed',
      value: stats.driversAssigned || 0,
      icon: <User className="w-8 h-8 text-teal-400" />,
      color: 'teal',
      trend: '+12%',
      description: 'In service'
    },
    {
      label: 'Active Routes',
      value: stats.vehiclesAssigned || 0,
      icon: <Database className="w-8 h-8 text-teal-400" />,
      color: 'teal',
      trend: '+15%',
      description: 'Operating'
    },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <LoadingOverlay isLoading={isLoading} message="Loading dashboard...">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                Branch Management Console
              </h1>
              <p className="text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-teal-400" />
                Last sync: {currentTime}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4" />
                <span>Connected</span>
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
              {/* Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <MetricCard key={card.label} {...card} />
                ))}
              </div>

              {/* Additional Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Overview */}
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="flex items-center text-lg font-bold text-white mb-6">
                    <MapPin className="w-5 h-5 mr-2 text-teal-400" />
                    Branch Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Dispatch Rate</span>
                        </div>
                        <span className="text-green-400 font-medium">
                          {stats.totalVehicles > 0 
                            ? Math.round((stats.vehiclesAssigned / stats.totalVehicles) * 100) 
                            : 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                          <span className="text-gray-300">Staff Productivity</span>
                        </div>
                        <span className="text-teal-400 font-medium">
                          {stats.totalDrivers > 0 
                            ? Math.round((stats.driversAssigned / stats.totalDrivers) * 100) 
                            : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-300">Reserve Fleet</span>
                        </div>
                        <span className="text-yellow-400 font-medium">
                          {stats.totalVehicles - stats.vehiclesAssigned}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <span className="text-gray-300">Standby Personnel</span>
                        </div>
                        <span className="text-purple-400 font-medium">
                          {stats.totalDrivers - stats.driversAssigned}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Panel */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="flex items-center text-lg font-bold text-white mb-6">
                    <Shield className="w-5 h-5 mr-2 text-teal-400" />
                    Your Permissions
                  </h3>
                  {!stats.permissions || stats.permissions.length === 0 ? (
                    <div className="text-center py-6">
                      <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No custom permissions assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.permissions.map((perm) => (
                        <div key={perm} className="flex items-center space-x-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                          <span className="text-sm text-teal-300 font-medium">{perm}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:border-white/30 hover:bg-white/15 transition cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Manage Vehicles</h3>
                      <p className="text-sm text-gray-400">Add or edit vehicles</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:border-white/30 hover:bg-white/15 transition cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">View Drivers</h3>
                      <p className="text-sm text-gray-400">Review driver profiles</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:border-white/30 hover:bg-white/15 transition cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Assign Vehicles</h3>
                      <p className="text-sm text-gray-400">Match drivers to vehicles</p>
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

function MetricCard({ label, value, icon, color, trend, description }) {
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
            <h3 className="font-medium text-gray-300">{label}</h3>
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
