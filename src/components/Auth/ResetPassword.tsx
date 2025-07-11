import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  ArrowLeft,
  AlertCircle,
  Key,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidToken, setIsValidToken] = useState(true); // Always true for UI demo

  // Extract token from URL on component mount
  useEffect(() => {
    // For UI demo purposes, we'll always show the reset form
    // In a real app, you'd extract and validate the token from URL
    // setToken("demo-token-12345");
    setIsValidToken(true);
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordErrors = validatePassword(formData.password);

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      console.log("Resetting password with token:", token);
      console.log("New password:", formData.password);
      const newPassword = formData.password;
      const response = await axios.post(
        `${URL}/api/user/rest-password/${token}`,
        { newPassword }
      );
      console.log(response);
      toast.success("Password Updated successfully");
      //   navigate("/signin");
      setIsSuccess(true);
    } catch (error: any) {
      setErrors([error.response.data.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    const strength = 5 - errors.length;

    if (strength <= 1)
      return { level: "weak", color: "bg-red-500", text: "Weak" };
    if (strength <= 3)
      return { level: "medium", color: "bg-yellow-500", text: "Medium" };
    return { level: "strong", color: "bg-green-500", text: "Strong" };
  };

  // Invalid token page
  if (!isValidToken) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
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

        <div className="relative z-10 h-full flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-8 shadow-2xl text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <AlertCircle className="text-white" size={36} />
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Invalid Reset Link
              </h1>

              <p className="text-gray-600 leading-relaxed mb-6">
                This password reset link is invalid or has expired. Please
                request a new password reset link.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Request New Reset Link
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {!isSuccess ? (
            // Reset Password Form
            <div className="bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Key className="text-white" size={28} />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Reset Your Password
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  Create a new secure password for your OFMBase account.
                </p>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">
                        Please fix the following:
                      </h4>
                      <ul className="text-red-800 text-sm space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
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
                      className="w-full pl-10 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Password strength:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            getPasswordStrength(formData.password).level ===
                            "strong"
                              ? "text-green-600"
                              : getPasswordStrength(formData.password).level ===
                                "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {getPasswordStrength(formData.password).text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getPasswordStrength(formData.password).color
                          }`}
                          style={{
                            width: `${
                              (5 - validatePassword(formData.password).length) *
                              20
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="w-full pl-10 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-sm text-green-600">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="text-red-500" size={16} />
                          <span className="text-sm text-red-600">
                            Passwords don't match
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.password.length >= 8
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>At least 8 characters</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[a-z])/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>One lowercase letter</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[A-Z])/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>One uppercase letter</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*\d)/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>One number</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[@$!%*?&])/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>One special character (@$!%*?&)</span>
                    </li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={
                    isLoading || !formData.password || !formData.confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      <span>Update Password</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          ) : (
            // Success Message
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-8 shadow-2xl text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="text-white" size={36} />
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Password Updated!
              </h1>

              <p className="text-gray-600 leading-relaxed mb-6">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-800">
                  <Shield size={20} />
                  <span className="font-semibold">
                    Your account is now secure
                  </span>
                </div>
              </div>

              <Link to="/signin">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signin")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Continue to Sign In
                </motion.button>
              </Link>

              {/* Additional Success Features */}
              <div className="mt-6 space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>What's next?</strong>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span>Password secured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span>Account protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span>Ready to sign in</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span>All set!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-green-500" />
                <span>Secure Reset</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Protected</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
