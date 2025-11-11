// frontend/src/pages/DriverDashboard.jsx
import { useState, useEffect } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";
import {
  UserCircle2,
  MapPin,
  ChevronDown,
  UploadCloud,
  Eye,
  Truck,
  Mail,
  Shield,
  CheckCircle,
  FileText,
} from "lucide-react";

const REGIONS = [
  { value: "northern", label: "Northern" },
  { value: "southern", label: "Southern" },
  { value: "central",  label: "Central"  },
  { value: "eastern",  label: "Eastern"  },
  { value: "western",  label: "Western"  },
];

export default function DriverDashboard() {
  const [user,     setUser]     = useState(null);
  const [region,   setRegion]   = useState("");
  const [msg,      setMsg]      = useState("");
  const [doc,      setDoc]      = useState(null);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [assigned, setAssigned] = useState([]);

  // Derive API base for static files
  const raw      = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const API_BASE = raw.replace(/\/api$/, "");

  useEffect(() => {
    // Load profile
    api.get("/auth/me")
      .then(r => {
        setUser(r.data);
        setRegion(r.data.region || "");
      })
      .catch(() => {});

    // Load existing license
    api.get("/driver-docs")
      .then(r => setDoc(r.data))
      .catch(() => setDoc(null));

    // Load assigned vehicles for this driver
    api.get("/vehicles/my-assigned")
      .then(r => setAssigned(r.data))
      .catch(() => setAssigned([]));
  }, []);

  // Save region update
  const saveRegion = async () => {
    setMsg("");
    try {
      const { data } = await api.patch("/auth/me", { region });
      setUser(data);
      setMsg("Region saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to save region");
    }
  };

  // File input change
  const onFileChange = e => setFile(e.target.files[0]);

  // Upload new license
  const uploadLicense = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("license", file);
    try {
      const { data } = await api.post("/driver-docs", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDoc(data);
      setFile(null);
      setMsg("License uploaded successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to upload license");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Driver Control Center</h1>
          <p className="text-gray-400">Review your profile, certifications, and vehicle assignments</p>
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

        {/* ACCOUNT INFO & REGION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <span>Personal Details</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Full Name</p>
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Email Address</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Zone</p>
                <p className="text-teal-300 font-medium">
                  {user.region
                    ? REGIONS.find(r => r.value === user.region)?.label
                    : "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Zone Assignment */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span>Zone Control</span>
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-white font-semibold mb-3">
                  Operating Zone
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none"
                >
                  <option value="" className="bg-gray-800">Pick zone...</option>
                  {REGIONS.map(r => (
                    <option key={r.value} value={r.value} className="bg-gray-800">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveRegion}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Confirm Zone
              </button>
            </div>
          </div>
        </div>

        {/* LICENSE SECTION */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <span>Professional Certification</span>
          </h2>

          <div className="space-y-6">
            {doc ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-300 text-sm mb-3">Certification uploaded and verified</p>
                <button
                  onClick={() => window.open(`${API_BASE}${doc.filePath}`, "_blank")}
                  className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 font-medium transition"
                >
                  <Eye className="w-5 h-5" />
                  <span>View Certification</span>
                </button>
              </div>
            ) : (
              <p className="text-gray-400">No certification uploaded yet.</p>
            )}

            <div className="border-t border-white/10 pt-6">
              <p className="text-white font-semibold mb-4">Upload Professional Document</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center px-6 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-white/10 transition">
                  <div className="flex items-center space-x-2">
                    <UploadCloud className="w-5 h-5 text-teal-400" />
                    <span className="text-gray-300">Select Document</span>
                  </div>
                  <input type="file" onChange={onFileChange} className="hidden" />
                </label>
                <button
                  onClick={uploadLicense}
                  disabled={!file || loading}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:shadow-none"
                >
                  {loading ? "Processing..." : "Upload"}
                </button>
              </div>
              {file && (
                <p className="text-teal-300 text-sm mt-3 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>File: <strong>{file.name}</strong></span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ASSIGNED VEHICLES */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-teal-400" />
            <span>Fleet Assignments</span>
          </h2>

          {assigned.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No vehicles assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {[
                      "License Plate",
                      "Vehicle Model",
                      "Capacity",
                      "Fuel Type",
                      "Assigned Date",
                    ].map(h => (
                      <th key={h} className="p-4 text-left text-gray-300 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assigned.map(v => (
                    <tr key={v._id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="p-4 text-white font-medium">{v.registrationNumber}</td>
                      <td className="p-4 text-white">{v.model}</td>
                      <td className="p-4 text-gray-300">{v.seatingCapacity} persons</td>
                      <td className="p-4 text-gray-300">{v.fuelType}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(v.updatedAt || v.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
