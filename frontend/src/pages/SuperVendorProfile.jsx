// src/pages/SuperVendorProfile.jsx
import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { UserCircle2, MapPin, Calendar, Globe, Mail, Shield, CheckCircle } from 'lucide-react';

const REGIONS = [
  { value: 'northern', label: 'Northern' },
  { value: 'southern', label: 'Southern' },
  { value: 'central',  label: 'Central'  },
  { value: 'eastern',  label: 'Eastern'  },
  { value: 'western',  label: 'Western'  },
];

export default function SuperVendorProfile() {
  const [user, setUser]     = useState(null);
  const [region, setRegion] = useState('');
  const [msg, setMsg]       = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setUser(res.data);
      setRegion(res.data.region || '');
    });
  }, []);

  const handleSave = async () => {
    setMsg('');
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/me', { region });
      setUser(data);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Update failed, try again');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Administrator Account</h1>
          <p className="text-gray-400">Oversee platform settings and administrative preferences</p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8">
          {/* PROFILE HERO CARD */}
          <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl shadow-2xl p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="relative flex items-center space-x-6">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30">
                <UserCircle2 className="w-24 h-24 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center space-x-2 text-white/90 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/90">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize font-semibold">{user.role?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS MESSAGE */}
          {msg && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${
              msg.includes('successfully') 
                ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
                : 'bg-red-500/20 border border-red-500/50 text-red-200'
            }`}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* ACCOUNT DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>Administrator Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Full Name</p>
                  <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Contact Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Access Level</p>
                  <p className="text-white font-medium capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Account History Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span>Account Timeline</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Registration Date</p>
                  <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current Status</p>
                  <p className="text-green-400 font-medium flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Verified</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SETTINGS FORM */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Globe className="w-6 h-6 text-teal-400" />
              <span>Geographic Zone Configuration</span>
            </h3>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">
                Assign Operating Zone
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              >
                <option value="" className="bg-gray-800">Choose a zone...</option>
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value} className="bg-gray-800">
                    {r.label}
                  </option>
                ))}
              </select>
              {region && (
                <p className="mt-3 text-teal-300 text-sm flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Zone Set: <strong>{REGIONS.find(r => r.value === region)?.label}</strong></span>
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {loading ? 'Updating...' : 'Update Configuration'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
