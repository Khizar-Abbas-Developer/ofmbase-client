import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { useDispatch } from "react-redux";
import { updateUserFields } from "../redux/user/userSlice";
import { ClipLoader } from "react-spinners";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const { clientSecret, plan } = location.state || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      console.error("CardElement not found or not mounted.");
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    });

    if (result.error) {
      console.error("Payment Error:", result.error.message);
      setIsLoading(false);
      navigate("/payment-failure");
    } else if (result.paymentIntent.status === "succeeded") {
      console.log("✅ Payment succeeded");
      const currentDate = new Date();

      // Calculate expiry date (1 month from now)
      const expiryDate = new Date(currentDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const dataToSend = {
        backEndId: plan.backEndId,
        userId: currentUser.id,
        subscriptionStart: currentDate.toISOString(), // current date-time in ISO format
        subscriptionExpiry: expiryDate.toISOString(), // expiry date-time in ISO format
      };

      try {
        const response = await axios.post(
          `${URL}/api/user/payment-confirm`,
          dataToSend,
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
    <div className="relative max-w-md mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10 rounded-xl">
          <ClipLoader />
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Subscribe to {plan?.name}</h2>
      <p className="mb-4 text-gray-600">Amount: ${plan?.price}</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 border rounded-md">
          <CardElement />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          disabled={!stripe || !elements || isLoading}
        >
          {isLoading ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
