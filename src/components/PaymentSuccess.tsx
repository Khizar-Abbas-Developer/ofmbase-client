import { useEffect } from "react";
import axios from "axios";
import { useAppSelector } from "../redux/hooks";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserFields } from "../redux/user/userSlice";

const PaymentSuccessPage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

  useEffect(() => {
    const sessionId = localStorage.getItem("stripeSessionId");
    console.log("Session ID from localStorage:", sessionId);

    if (!sessionId) return;

    (async () => {
      try {
        // ✅ Step 1: Verify session with backend
        const { data } = await axios.post(`${URL}/api/payment/verify-session`, {
          sessionId,
        });

        const { plan, userId } = data;

        // ✅ Step 2: Calculate dates
        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(currentDate.getMonth() + 1);

        // ✅ Step 3: Save payment confirmation to backend
        const confirmRes = await axios.post(
          `${URL}/api/user/payment-confirm`,
          {
            backEndId: plan.backEndId,
            userId,
            subscriptionStart: currentDate.toISOString(),
            subscriptionExpiry: expiryDate.toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        // ✅ Step 4: Update Redux user state
        dispatch(updateUserFields(confirmRes.data.user));

        // ✅ Step 5: Clean up localStorage
        localStorage.removeItem("stripeSessionId");
      } catch (err) {
        console.error("Error verifying session or updating DB:", err);
        navigate("/payment-failure"); // optional: redirect to failure page
      }
    })();
  }, [dispatch, navigate]);

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
