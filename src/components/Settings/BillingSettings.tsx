import React from 'react';
import { Check } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  current?: boolean;
}

const BillingSettings = () => {
  const plans: Plan[] = [
    {
      name: 'Free',
      price: 0,
      features: [
        '1 Creator',
        '2 Employees',
        '3GB Content Storage',
      ],
      buttonText: 'Current Plan',
      current: true,
    },
    {
      name: 'Starter',
      price: 29,
      features: [
        'Up to 5 creators',
        'Up to 3 employees',
        '10GB Content Storage',
      ],
      buttonText: 'Subscribe to Starter',
      isPopular: true,
    },
    {
      name: 'Professional',
      price: 79,
      features: [
        'Up to 15 creators',
        'Up to 10 employees',
        '50GB Content Storage',
        'Priority Support',
      ],
      buttonText: 'Subscribe to Professional',
    },
    {
      name: 'Enterprise',
      price: 199,
      features: [
        'Up to 50 creators',
        'Up to 30 employees',
        '200GB Content Storage',
        '24/7 Priority Support',
        'Dedicated Account Manager',
      ],
      buttonText: 'Upgrade to Enterprise',
    },
  ];

  const handleSubscribe = (plan: Plan) => {
    // Handle subscription
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Subscription Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl p-6 border ${
              plan.current
                ? 'border-blue-200 ring-1 ring-blue-500'
                : plan.isPopular
                ? 'border-blue-100 bg-blue-50'
                : 'border-slate-200'
            }`}
          >
            {plan.isPopular && (
              <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
                Starter
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-800">{plan.name}</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
              <span className="ml-1 text-slate-500">/mo</span>
            </div>

            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={plan.current}
              className={`mt-8 w-full px-4 py-2 rounded-xl text-sm font-medium ${
                plan.current
                  ? 'bg-blue-50 text-blue-700 cursor-default'
                  : 'bg-black text-white hover:bg-gray-800'
              } transition-colors`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BillingSettings;