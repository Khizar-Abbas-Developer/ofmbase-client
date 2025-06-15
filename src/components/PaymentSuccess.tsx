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
    const stripeSessionId = localStorage.getItem("stripeSessionId");
    const coinbaseChargeId = localStorage.getItem("coinbaseChargeId");
    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(currentDate.getMonth() + 1);

    const confirmSubscription = async ({ backEndId, userId }) => {
      const confirmRes = await axios.post(
        `${URL}/api/user/payment-confirm`,
        {
          backEndId,
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

      dispatch(updateUserFields(confirmRes.data.user));
    };

    const verifyStripe = async () => {
      try {
        const { data } = await axios.post(`${URL}/api/payment/verify-session`, {
          sessionId: stripeSessionId,
        });

        await confirmSubscription({
          backEndId: data.plan.backEndId,
          userId: data.userId,
        });

        localStorage.removeItem("stripeSessionId");
      } catch (err) {
        console.error("Stripe verification failed:", err);
        navigate("/payment-failure");
      }
    };

    const verifyCoinbase = async () => {
      try {
        const { data } = await axios.post(
          `${URL}/api/payment/verify-coinbase-session`,
          {
            chargeId: coinbaseChargeId,
          }
        );

        if (data.status === "COMPLETED") {
          await confirmSubscription({
            backEndId: data.plan.backEndId,
            userId: data.userId,
          });

          localStorage.removeItem("coinbaseChargeId");
        } else {
          navigate("/payment-failure");
        }
      } catch (err) {
        console.error("Coinbase verification failed:", err);
        navigate("/payment-failure");
      }
    };

    if (stripeSessionId) verifyStripe();
    else if (coinbaseChargeId) verifyCoinbase();
  }, [dispatch, navigate, currentUser.token, URL]);

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
