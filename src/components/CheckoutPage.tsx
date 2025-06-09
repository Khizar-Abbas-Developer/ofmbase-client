import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { useDispatch } from "react-redux";
import { updateUserFields } from "../redux/user/userSlice";
import { ClipLoader } from "react-spinners";
import { TrendingUp } from "lucide-react";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const { clientSecret, plan } = location.state || {};

  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        "::placeholder": { color: "#a0aec0" },
      },
      invalid: {
        color: "#fa755a",
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardNumberElement);
    if (!card) return;

    setIsLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          email,
          name,
          address: {
            line1: address,
          },
        },
      },
    });

    if (result.error) {
      console.error("Payment Error:", result.error.message);
      setIsLoading(false);
      navigate("/payment-failure");
    } else if (result.paymentIntent.status === "succeeded") {
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      try {
        const response = await axios.post(
          `${URL}/api/user/payment-confirm`,
          {
            backEndId: plan.backEndId,
            userId: currentUser.id,
            subscriptionStart: currentDate.toISOString(),
            subscriptionExpiry: expiryDate.toISOString(),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        dispatch(updateUserFields(response.data.user));
        navigate("/payment-success");
      } catch (error) {
        console.error("❌ Backend payment confirm error:", error);
        navigate("/payment-failure");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl grid md:grid-cols-2 p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10 rounded-xl">
            <ClipLoader />
          </div>
        )}

        {/* Order Summary */}
        <div className="pr-8 border-r border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="flex items-start gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                OFMBase
              </span>
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {plan?.name || "Phoenix Deployhandbook Test"}
              </h3>
              <p className="text-sm text-gray-500">
                How to deploy Phoenix app...
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${plan?.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>—</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total due</span>
              <span>${plan?.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="pl-8">
          <h3 className="text-lg font-medium mb-4">Pay with card</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-4">
              <div className="border rounded-md px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                <CardNumberElement options={elementOptions} />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 border rounded-md px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                  <CardExpiryElement options={elementOptions} />
                </div>
                <div className="w-1/2 border rounded-md px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                  <CardCvcElement options={elementOptions} />
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Name on card"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Billing address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!stripe || !elements || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Pay"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
