import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Send, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";


const VerifyEmailSent = () => {
  const location = useLocation();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

  useEffect(() => {
    const state = location.state;
    if (state) {
      setFormData(state);
    }
  }, [location.state]);

  const signUp = async () => {
    try {
      setIsLoading(true);
      const dataToSend = {
        ...formData, // spreads all key-value pairs from formData
        method: "custom", // adds a new key or overrides existing one
      };
      const response = await axios.post(`${URL}/api/user/register`, dataToSend);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (formData) {
      signUp();
    }
  }, [formData]);

  const handleBackToSignIn = () => {
    onBack();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader />
        </div>
      ) : (
        <>
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

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToSignIn}
            className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 z-10"
          ></motion.button>

          <div className="relative z-10 h-full flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md"
            >
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
                  Verify Your Email
                </h1>

                <p className="text-gray-600 leading-relaxed mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-gray-900">
                    {formData.email}
                  </span>
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Mail
                      className="text-blue-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Next Steps:
                      </h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Check your email inbox</li>
                        <li>• Click the "Verify Email" button in the email</li>
                        <li>• Sign in with your new account</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link to="/signin">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBackToSignIn}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Back to Sign In
                    </motion.button>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signUp()}
                    className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Resend Email
                  </motion.button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => signUp()}
                      className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </motion.div>
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
                    <span>Safe & Private</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default VerifyEmailSent;
