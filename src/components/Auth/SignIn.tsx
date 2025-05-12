import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../redux/hooks";
import { singInSuccess } from "../../redux/user/userSlice";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const dataToSend = {
        email,
        password,
      };
      const response = await axios.post(`${URL}/api/user/login`, dataToSend);
      console.log(response.data.user);

      toast.success(response.data.message);
      dispatch(singInSuccess(response.data.user));
      navigate("/");
    } catch (err: any) {
      setError(err.response.data.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes("confirm your email") && (
                <p className="mt-1">
                  Check your email inbox and click the confirmation link we sent
                  you.
                </p>
              )}
              {error.includes("Incorrect email or password") && (
                <p className="mt-1">
                  Double check your email and password, or{" "}
                  <Link
                    to="/reset-password"
                    className="text-red-700 hover:text-red-800 underline"
                  >
                    reset your password
                  </Link>
                </p>
              )}
            </div>
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
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
