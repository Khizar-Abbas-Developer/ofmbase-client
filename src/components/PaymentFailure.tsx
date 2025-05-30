import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailurePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="mb-6 text-gray-700">
          Something went wrong. Please try again or use a different payment
          method.
        </p>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          onClick={() => navigate("/settings")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
