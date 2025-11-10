import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Truck, Shield } from "lucide-react";
import api from "../api/axiosClient.js";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { LoadingOverlay } from "../components/ui/Loading.jsx";

export default function Register() {
    const [form, setForm] = useState({
        firstName: "", 
        lastName: "", 
        email: "", 
        password: "", 
        confirmPassword: "",
        role: "driver"
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }
        return true;
    };

    const submit = async e => {
        e.preventDefault();
        setError(null);
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            const { confirmPassword, ...submitData } = form;
            await api.post("/auth/register", submitData);
            setSuccess(true);
            setTimeout(() => nav("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        { value: "super_vendor", label: "Super Vendor", icon: Shield },
        { value: "regional_vendor", label: "Regional Vendor", icon: User },
        { value: "driver", label: "Driver", icon: Truck },
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
                </div>
                <Card variant="glass" className="max-w-md w-full text-center backdrop-blur-xl border-white/30 shadow-xl">
                    <CardContent className="pt-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                        <p className="text-gray-600 mb-6">
                            Your account has been successfully created. Redirecting to login...
                        </p>
                        <div className="animate-pulse">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
                    <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
                    <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
                </div>
            </div>

            <div className="w-full max-w-lg">
                <LoadingOverlay isLoading={isLoading} message="Creating your account...">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Create Account
                        </h1>
                        <p className="text-gray-600 mt-2">Join the VMS platform today</p>
                    </div>

                    <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-xl">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-xl font-semibold text-gray-900">Sign Up</CardTitle>
                            <CardDescription>Fill in your details to create your account</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {error && (
                                    <Alert variant="danger" className="animate-fade-in">
                                        <p className="text-sm">{error}</p>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                            className="pl-11"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                            className="pl-11"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
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
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Create password"
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

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className="pl-11 pr-11"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select your role
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {roleOptions.map((option) => {
                                            const IconComponent = option.icon;
                                            return (
                                                <label
                                                    key={option.value}
                                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                                        form.role === option.value
                                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value={option.value}
                                                        checked={form.role === option.value}
                                                        onChange={handleChange}
                                                        className="sr-only"
                                                        disabled={isLoading}
                                                    />
                                                    <IconComponent className={`w-5 h-5 mr-3 ${
                                                        form.role === option.value ? 'text-blue-600' : 'text-gray-400'
                                                    }`} />
                                                    <span className={`font-medium ${
                                                        form.role === option.value ? 'text-blue-900' : 'text-gray-700'
                                                    }`}>
                                                        {option.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    variant="success"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="pt-6 border-t border-gray-100">
                            <p className="text-sm text-center w-full text-gray-600">
                                Already have an account?{" "}
                                <Link 
                                    to="/login" 
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </LoadingOverlay>
            </div>
        </div>
    );
}
