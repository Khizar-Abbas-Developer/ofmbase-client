import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Lottie from "lottie-react";
import { useAppDispatch } from "../../redux/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { singInSuccess } from "../../redux/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";


const AuthPage = () => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Load a professional Lottie animation
    fetch(
      "https://lottie.host/4f7c5c4d-2c4a-4f4a-9c4a-8f7e6d5c4b3a/animation.json"
    )
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => {
        console.error("Error loading Lottie animation:", error);
        // Fallback animation URL
        fetch(
          "https://lottie.host/0914be53-6636-4f16-9b35-533ebdbafb6f/HeW87xjW9w.json"
        )
          .then((response) => response.json())
          .then((data) => setAnimationData(data))
          .catch((err) => console.error("Fallback animation failed:", err));
      });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsLoading(true);
    setError("");
    if (isSignUp) {
      navigate("/verify-email-sent", {
        state: formData,
      });
    } else {
      try {
        const response = await axios.post(`${URL}/api/user/login`, formData);
        toast.success(response.data.message);

        dispatch(singInSuccess(response.data.user));
        navigate("/");
      } catch (error: any) {
        setError(error.response.data.message || "Failed to sign in");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 h-full flex">
        {/* Left Column - Lottie Animation */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg"
          >
            {/* Animation Container */}
            <div className="bg-white/60 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
              <div className="w-full h-96 flex items-center justify-center">
                {animationData ? (
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <div className="w-12 h-12">
                          <svg
                            viewBox="0 0 480.42 480.24"
                            className="w-full h-full"
                          >
                            <defs>
                              <style>{`.cls-1 { fill: white; }`}</style>
                            </defs>
                            <g>
                              <circle
                                className="cls-1"
                                cx="240.21"
                                cy="72"
                                r="72"
                              />
                              <path
                                className="cls-1"
                                d="M464.21,192H16.21c-16,0-22.4,20-8.8,28.8l116.8,75.2c5.6,4,8.8,11.2,6.4,17.6l-44,146.4c-4.8,16,16,27.2,28,15.2l113.6-120c6.4-7.2,17.6-7.2,24,0l113.6,120c11.2,12,32,.8,28-15.2l-44-146.4c-1.6-6.4.8-13.6,6.4-17.6l116.8-75.2c13.6-8.8,7.2-28.8-8.8-28.8Z"
                              />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className="text-gray-600">Loading animation...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  OFMBase
                </span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The ultimate platform for content creator agencies. Streamline
                your operations and scale your business with powerful tools
                designed for modern agencies.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Form Container */}
            <div className="bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <div className="w-10 h-10">
                    <svg viewBox="0 0 480.42 480.24" className="w-full h-full">
                      <defs>
                        <style>{`.cls-1 { fill: white; }`}</style>
                      </defs>
                      <g>
                        <circle className="cls-1" cx="240.21" cy="72" r="72" />
                        <path
                          className="cls-1"
                          d="M464.21,192H16.21c-16,0-22.4,20-8.8,28.8l116.8,75.2c5.6,4,8.8,11.2,6.4,17.6l-44,146.4c-4.8,16,16,27.2,28,15.2l113.6-120c6.4-7.2,17.6-7.2,24,0l113.6,120c11.2,12,32,.8,28-15.2l-44-146.4c-1.6-6.4.8-13.6,6.4-17.6l116.8-75.2c13.6-8.8,7.2-28.8-8.8-28.8Z"
                        />
                      </g>
                    </svg>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? "signup" : "signin"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-gray-600">
                      {isSignUp
                        ? "Start your journey with OFMBase today"
                        : "Sign in to your OFMBase account"}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? "signup-form" : "signin-form"}
                    initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Email Field */}
                    {error && (
                      <p className="bg-red-400 p-3 rounded-md text-white">
                        {error}
                      </p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password (Sign In Only) */}
                    {!isSignUp && (
                      <div className="flex justify-end">
                        <Link to="/forgot-password">
                          <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                        </Link>
                      </div>
                    )}

                    {/* Terms and Conditions (Sign Up Only) */}
                    {isSignUp && (
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                          required={isSignUp}
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the{" "}
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Privacy Policy
                          </a>
                        </span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mt-8"
                >
                  <span className="flex gap-2 items-center">
                    {isSignUp ? "Create Account" : "Sign In"}
                    {isLoading ? <ClipLoader size={14} /> : ""}
                  </span>
                  {!isLoading && <CheckCircle size={20} color="white" />}
                </motion.button>

                {/* Toggle Auth Mode */}
                <div className="text-center mt-6">
                  <span className="text-gray-600">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}
                  </span>{" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
