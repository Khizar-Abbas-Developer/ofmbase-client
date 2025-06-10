import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { ClipLoader } from "react-spinners";
import { TrendingUp } from "lucide-react";

const CheckoutPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAppSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

  const { plan } = location.state || {};

  const handleStripeCheckout = async () => {
    if (!stripe || !plan) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${URL}/api/payment/create-checkout-session`,
        {
          planId: plan.backEndId,
          userId: currentUser.id,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      const { url, sessionId } = response.data;
      localStorage.setItem("stripeSessionId", sessionId); // fallback if no Redux setup
      

      // ✅ Redirect user to Stripe Checkout hosted page
      window.location.href = url;
    } catch (err) {
      console.error("Error creating Stripe Checkout session:", err);
      navigate("/payment-failure");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10 rounded-xl">
            <ClipLoader />
          </div>
        )}

        <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{plan?.name}</h3>
            <p className="text-sm text-gray-500">Plan details and pricing</p>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${plan?.price}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>${plan?.price}</span>
          </div>
        </div>

        <button
          onClick={handleStripeCheckout}
          disabled={isLoading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-sm font-medium transition disabled:opacity-50"
        >
          {isLoading ? "Redirecting..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
