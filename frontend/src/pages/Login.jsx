import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff, Truck } from "lucide-react";
import api from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { LoadingOverlay } from "../components/ui/Loading.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log("✅ Login success:", data);

      // store token + role
      login(data.token, data.role);

      // send user to the correct dashboard
      if (data.role === "super_vendor") nav("/super", { replace: true });
      else if (data.role === "regional_vendor") nav("/regional", { replace: true });
      else nav("/driver", { replace: true });
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
        </div>
      </div>

      <div className="w-full max-w-md">
        <LoadingOverlay isLoading={isLoading} message="Signing you in...">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Sign in to your VMS account</p>
          </div>

          <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="danger" className="animate-fade-in">
                    <p className="text-sm">{error}</p>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-11"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-11 pr-11"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pt-6 border-t border-gray-100">
              <p className="text-sm text-center w-full text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Vendor & Driver Management System
            </p>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
}
