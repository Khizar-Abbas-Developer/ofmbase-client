import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

interface Plan {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  current?: boolean;
  backEndId: Number;
  active: boolean;
}

const BillingSettings = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setIsLoading(true);
      const items = [{ backEndId: plan.backEndId }];
      const response = await axios.post(
        `${URL}/api/user/payment-stripe`,
        { items },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      const { success, clientSecret } = response.data;

      if (success) {
        if (!clientSecret) {
          alert("Free plan selected. You're all set.");
        } else {
          navigate("/checkout", { state: { clientSecret, plan } });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${URL}/api/subscriptions/fetch-subscriptions`
      );
      const fetchedPlans: Plan[] = response.data.packages.map((plan: any) => ({
        backEndId: plan._id,
        name: plan.name,
        price: plan.price,
        features: [
          `${plan.creators} Creators`,
          `${plan.employees} Employees`,
          `${plan.storage}GB Content Storage`,
        ],
        isPopular: plan.isPopular,
        current: plan.current,
        active: plan.active,
      }));
      setPlans(fetchedPlans);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, [currentUser, navigate, URL]);

  return (
    <>
      {isLoading ? (
        <>
          <div className="flex justify-center items-center h-screen">
            <ClipLoader />
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Subscription Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans
                .filter((plan) => plan.active === true)
                .map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-white rounded-2xl p-6 border ${
                      currentUser?.subscribedPackage === plan.name
                        ? "border-blue-200 ring-1 ring-blue-500"
                        : plan.isPopular
                        ? "border-blue-100 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
                        Popular
                      </span>
                    )}
                    <h3
                      className={`text-lg font-semibold text-slate-800 ${
                        plan?.name === "Free" &&
                        currentUser.subscribedPackage !== "Free"
                          ? "text-gray-200"
                          : "text-slate-800"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="ml-1 text-slate-500">/mo</span>
                    </div>

                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={
                        currentUser?.subscribedPackage === plan.name ||
                        plan.name === "Free"
                      }
                      className={`mt-8 w-full px-4 py-2 rounded-xl text-sm font-medium ${
                        plan.current
                          ? "bg-blue-50 text-blue-700 cursor-default"
                          : "bg-black text-white hover:bg-gray-800"
                      } transition-colors`}
                      // disabled={currentUser?.subscribedPackage !== "Free"}
                    >
                      {currentUser?.subscribedPackage === plan.name
                        ? "Current Plan"
                        : `Subscribe to ${plan.name}`}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BillingSettings;
