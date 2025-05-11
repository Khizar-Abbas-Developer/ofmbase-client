import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../lib/store";
import axios from "axios";
import toast from "react-hot-toast";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const resendVerification = useAuthStore((state) => state.resendVerification);

  const handleSubmit = async (e: React.FormEvent, value?: string) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const dataToSend = {
        email,
        password,
        method: "custom",
      };
      const response = await axios.post(`${URL}/api/user/register`, dataToSend);
      setIsVerificationSent(true);
      setIsVerificationSent(true);

      toast.success(response.data.message);
    } catch (err: any) {
      if (value === "already") {
        setError("Email is already verified");

        navigate("/signin");
        return;
      }
      setError(err.response.data.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    try {
      setIsLoading(true);
      await handleSubmit(e, "already");
      setIsVerificationSent(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Create your account
        </h1>
        <p className="text-slate-500 mt-2">Get started with your agency</p>
      </div>

      {isVerificationSent ? (
        <div className="text-center">
          <div className="p-4 mb-4 text-sm text-blue-600 bg-blue-50 rounded-lg">
            <p className="font-medium mb-2">Please check your email</p>
            <p>We've sent a verification link to {email}</p>
          </div>
          <button
            onClick={(e) => handleResendVerification(e)}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLoading ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default SignUp;
