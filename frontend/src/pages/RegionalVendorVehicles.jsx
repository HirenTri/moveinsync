// src/pages/RegionalVendorVehicles.jsx
import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { LoadingOverlay } from '../components/ui/Loading.jsx';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  PlusCircle, 
  Eye, 
  Upload,
  Car,
  Fuel,
  Users,
  FileText,
  Download,
  Search,
  Filter
} from 'lucide-react';

const FUELS = ['Petrol','Diesel','Electric','Hybrid'];

export default function RegionalVendorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [form, setForm] = useState({
    registrationNumber:'', model:'', seatingCapacity:'', fuelType:'Petrol', region:''
  });
  const [files, setFiles] = useState({ permitFile:null, rcFile:null, pollutionFile:null });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [permissions, setPermissions] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const root = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/auth/me');
        const perms = meRes.data.customPermissions || [];
        setPermissions(perms);
        setForm(f => ({ ...f, region: meRes.data.region || '' }));

        if (perms.includes('View Vehicles')) {
          setLoadingVehicles(true);
          const vehRes = await api.get('/vehicles');
          setVehicles(vehRes.data);
          setFilteredVehicles(vehRes.data);
          setLoadingVehicles(false);
        }
      } catch (err) {
        console.error(err);
        setMsgType('danger');
        setMsg('Failed to load vehicles');
      }
    };
    fetchData();
  }, []);

  // Filter vehicles based on search and status
  useEffect(() => {
    let filtered = vehicles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle =>
        filterStatus === 'assigned' ? vehicle.assigned : !vehicle.assigned
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filterStatus]);

  const handleChange = e => setForm(f=>({...f,[e.target.name]: e.target.value}));
  
  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      setFiles(f=>({...f,[e.target.name]: file}));
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    setMsg('');
    setIsSubmitting(true);

    // permission check
    if (!permissions.includes('Add Vehicles')) {
      setMsgType('danger');
      setMsg('You do not have permission to add vehicles.');
      setIsSubmitting(false);
      return;
    }

    // file check
    if (!files.rcFile || !files.permitFile || !files.pollutionFile) {
      setMsgType('danger');
      setMsg('Please upload all required documents (RC, Permit, and Pollution files)');
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k,v]) => data.append(k, v));
      Object.entries(files).forEach(([k,f]) => data.append(k,f));

      const { data: newVeh } = await api.post('/vehicles', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVehicles(vs => [newVeh, ...vs]);
      setMsgType('success');
      setMsg('Vehicle added successfully!');
      setForm({ ...form, registrationNumber:'', model:'', seatingCapacity:'' });
      setFiles({ permitFile:null, rcFile:null, pollutionFile:null });
      
      // Clear file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
    } catch (err) {
      setMsgType('danger');
      setMsg(err.response?.data?.msg || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vs => vs.filter(v => v._id !== id));
      setMsgType('success');
      setMsg('Vehicle deleted successfully');
    } catch (err) {
      setMsgType('danger');
      setMsg(err.response?.data?.msg || 'Delete failed');
    }
  };

  const fileName = f => f ? (typeof f === 'string' ? f.split('/').pop() : f.name) : '';

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <LoadingOverlay isLoading={loadingVehicles} message="Loading vehicles...">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Vehicle Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your fleet of vehicles</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{filteredVehicles.length} Vehicle{filteredVehicles.length !== 1 ? 's' : ''}</Badge>
            </div>
          </div>

          {msg && (
            <Alert variant={msgType} className="animate-fade-in">
              <p>{msg}</p>
            </Alert>
          )}

          {/* Add Vehicle Form */}
          {permissions.includes('Add Vehicles') && (
            <Card variant="gradient" className="border-2 border-dashed border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="mr-2 text-blue-600" /> Add New Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number *
                      </label>
                      <Input
                        name="registrationNumber"
                        value={form.registrationNumber}
                        onChange={handleChange}
                        placeholder="Enter registration number"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Model *
                      </label>
                      <Input
                        name="model"
                        value={form.model}
                        onChange={handleChange}
                        placeholder="Enter vehicle model"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seating Capacity *
                      </label>
                      <Input
                        name="seatingCapacity"
                        value={form.seatingCapacity}
                        onChange={handleChange}
                        type="number"
                        placeholder="Enter capacity"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuel Type *
                      </label>
                      <select
                        name="fuelType"
                        value={form.fuelType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        disabled={isSubmitting}
                      >
                        {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region
                      </label>
                      <Input
                        name="region"
                        value={form.region}
                        onChange={handleChange}
                        placeholder="Region"
                        disabled
                      />
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['rcFile', 'permitFile', 'pollutionFile'].map((fileType) => (
                      <div key={fileType} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {fileType === 'rcFile' ? 'RC Document *' : 
                           fileType === 'permitFile' ? 'Permit Document *' : 
                           'Pollution Certificate *'}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name={fileType}
                            onChange={handleFile}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id={fileType}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={fileType}
                            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                          >
                            <Upload className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {files[fileType] ? fileName(files[fileType]) : 'Choose file'}
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by registration number or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm"
              >
                <option value="all">All Vehicles</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Available</option>
              </select>
            </div>
          </div>

          {/* Vehicles List */}
          {permissions.includes('View Vehicles') ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle._id} 
                  vehicle={vehicle} 
                  onDelete={handleDelete}
                  root={root}
                  canDelete={permissions.includes('Delete Vehicles')}
                />
              ))}
              
              {filteredVehicles.length === 0 && !loadingVehicles && (
                <div className="lg:col-span-2 xl:col-span-3 text-center py-12">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterStatus !== 'all' ? 'No vehicles found' : 'No vehicles yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : permissions.includes('Add Vehicles') 
                        ? 'Add your first vehicle using the form above'
                        : 'No vehicles have been added to your region yet'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Alert variant="warning">
              <p>You don't have permission to view vehicles. Please contact your administrator.</p>
            </Alert>
          )}
        </LoadingOverlay>
      </main>
    </div>
  );
}

function VehicleCard({ vehicle, onDelete, root, canDelete }) {
  const getStatusBadge = () => {
    if (vehicle.assigned) {
      return <Badge variant="success">Assigned</Badge>;
    }
    return <Badge variant="warning">Available</Badge>;
  };

  const getFuelIcon = (fuelType) => {
    return <Fuel className="w-4 h-4" />;
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {vehicle.registrationNumber}
            </CardTitle>
            <p className="text-gray-600 mt-1">{vehicle.model}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{vehicle.seatingCapacity} seats</span>
          </div>
          <div className="flex items-center space-x-2">
            {getFuelIcon(vehicle.fuelType)}
            <span className="text-sm text-gray-600">{vehicle.fuelType}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Documents:</h4>
          <div className="grid grid-cols-3 gap-2">
            {['rcFile', 'permitFile', 'pollutionFile'].map((docType) => (
              <a
                key={docType}
                href={`${root}${vehicle[docType]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                <Download className="w-3 h-3 text-gray-400 group-hover:text-blue-600 ml-1" />
              </a>
            ))}
          </div>
        </div>
      </CardContent>

      {canDelete && (
        <CardFooter>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(vehicle._id)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Vehicle
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}