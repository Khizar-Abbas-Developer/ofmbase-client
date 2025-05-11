import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  // pull `token` out of the URL
  const { token } = useParams<{ token: string }>();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const verifyEmailAddress = async () => {
    try {
      // e.g. call your verify API
      const response = await axios.get(`${URL}/api/user/verify-email/${token}`);
      toast.success("Email Verified Successfully");
      navigate("/signin");
    } catch (error: any) {
      setError(error.response.data.message);
    }
  };

  useEffect(() => {
    if (token) {
      verifyEmailAddress();
    }
  }, [token]);

  return (
    <>
      <h1 className="text-2xl font-semibold">{error}</h1>
    </>
  );
};

export default VerifyEmail;
