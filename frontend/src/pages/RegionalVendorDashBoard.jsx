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
      label: 'Total Drivers',
      value: stats.totalDrivers || 0,
      icon: <Users className="w-8 h-8 text-blue-500" />,
      color: 'blue',
      trend: '+5%',
      description: 'Registered drivers'
    },
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles || 0,
      icon: <Truck className="w-8 h-8 text-green-500" />,
      color: 'green',
      trend: '+8%',
      description: 'Fleet vehicles'
    },
    {
      label: 'Drivers Assigned',
      value: stats.driversAssigned || 0,
      icon: <User className="w-8 h-8 text-purple-500" />,
      color: 'purple',
      trend: '+12%',
      description: 'Active assignments'
    },
    {
      label: 'Vehicles Assigned',
      value: stats.vehiclesAssigned || 0,
      icon: <Database className="w-8 h-8 text-orange-500" />,
      color: 'orange',
      trend: '+15%',
      description: 'In operation'
    },
  ] : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <LoadingOverlay isLoading={isLoading} message="Loading dashboard...">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Regional Vendor Dashboard
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Last updated: {currentTime}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Online</span>
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
              {/* Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <MetricCard key={card.label} {...card} />
                ))}
              </div>

              {/* Additional Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Overview */}
                <Card variant="gradient" className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Regional Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-gray-700">Assignment Rate</span>
                          </div>
                          <span className="text-green-600 font-medium">
                            {stats.totalVehicles > 0 
                              ? Math.round((stats.vehiclesAssigned / stats.totalVehicles) * 100) 
                              : 0}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-700">Driver Utilization</span>
                          </div>
                          <span className="text-blue-600 font-medium">
                            {stats.totalDrivers > 0 
                              ? Math.round((stats.driversAssigned / stats.totalDrivers) * 100) 
                              : 0}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <span className="text-gray-700">Available Vehicles</span>
                          </div>
                          <span className="text-yellow-600 font-medium">
                            {stats.totalVehicles - stats.vehiclesAssigned}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <span className="text-gray-700">Unassigned Drivers</span>
                          </div>
                          <span className="text-purple-600 font-medium">
                            {stats.totalDrivers - stats.driversAssigned}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions Panel */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Your Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!stats.permissions || stats.permissions.length === 0 ? (
                      <div className="text-center py-6">
                        <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No custom permissions assigned</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.permissions.map((perm) => (
                          <div key={perm} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-800 font-medium">{perm}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <Card className="flex-1 min-w-48 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Manage Vehicles</h3>
                      <p className="text-sm text-gray-600">Add or edit vehicles</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-48 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">View Drivers</h3>
                      <p className="text-sm text-gray-600">Review driver profiles</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-48 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Assign Vehicles</h3>
                      <p className="text-sm text-gray-600">Match drivers to vehicles</p>
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

function MetricCard({ label, value, icon, color, trend, description }) {
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
              <h3 className="font-medium text-gray-700">{label}</h3>
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
