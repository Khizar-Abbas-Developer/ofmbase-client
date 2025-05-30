import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="mb-6 text-gray-700">
          Thank you for your purchase. Your subscription is now active.
        </p>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
