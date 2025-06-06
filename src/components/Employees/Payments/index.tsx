import React, { useState, useEffect } from "react";
import { Plus, DollarSign, Calendar, User } from "lucide-react";
import type { Employee } from "../index";
import PaymentModal from "./PaymentModal";
import axios from "axios";
import { useAppSelector } from "../../../redux/hooks"; // Adjust the path as needed

interface Payment {
  _id: string;
  employee_id: string;
  amount: number;
  date: string;
  payment_method: string;
  description: string;
  created_at: string;
  employee?: {
    name: string;
  };
}

interface TimeEntry {
  _id: string;
  employee_id: string;
  hours: number;
  date: string;
  creator_sales?: {
    amount: number;
  }[];
}

interface PaymentsProps {
  employees: Employee[];
}

const Payments: React.FC<PaymentsProps> = ({ employees }) => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    Promise.all([fetchPayments(), fetchTimeEntries()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  const fetchPayments = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/payment/fetch-payments/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/time-tracking/fetch-time-tracking/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setTimeEntries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  const handleCreatePayment = async (
    payment: Omit<Payment, "id" | "created_at">
  ) => {
    try {
      setIsLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const dataToSend = { ...payment, ownerId: requiredId };
      await axios.post(`${URL}/api/payment/create-payments`, dataToSend, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      fetchPayments();
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // June 1
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ); // June 30
    return { start, end };
  };

  const calculateAmountOwed = (employeeId: string) => {
    const { start, end } = getDateRange();
    const employee = employees.find((e) => e._id === employeeId);
    if (!employee) return 0;

    const relevantEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entry.employee_id === employeeId &&
        entryDate >= start &&
        entryDate <= end
      );
    });

    // Calculate base pay from hours worked
    const baseAmount = relevantEntries.reduce((sum, entry) => {
      return sum + entry.hours * employee.hourly_rate;
    }, 0);

    // Calculate bonus amounts
    const bonusAmount = relevantEntries.reduce((sum, entry) => {
      const salesAmount =
        entry.creator_sales?.reduce((total, sale) => total + sale.amount, 0) ||
        0;
      // TODO: Add bonus calculation based on bonus systems
      return sum + salesAmount;
    }, 0);

    return baseAmount + bonusAmount;
  };

  const calculateAmountPaid = (employeeId: string) => {
    const { start, end } = getDateRange();

    return payments
      .filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          payment.employee_id === employeeId &&
          paymentDate >= start &&
          paymentDate <= end
        );
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const filteredPayments = payments.filter((payment) => {
    const { start, end } = getDateRange();
    const paymentDate = new Date(payment.date);

    const employeeId =
      typeof payment.employee_id === "object" && payment.employee_id !== null
        ? payment.employee_id.toString()
        : String(payment.employee_id);

    const employeeMatches =
      selectedEmployee === "all" || employeeId === selectedEmployee.toString();

    const dateMatches =
      !start || !end || (paymentDate >= start && paymentDate <= end);

    const shouldInclude =
      selectedEmployee === "all" ? true : employeeMatches && dateMatches;

    return shouldInclude;
  });

  const calculateTotalAmountOwed = () => {
    if (selectedEmployee === "all") {
      return employees.reduce(
        (total, employee) => total + calculateAmountOwed(employee._id),
        0
      );
    }
    return calculateAmountOwed(selectedEmployee);
  };

  const calculateTotalAmountPaid = () => {
    if (selectedEmployee === "all") {
      return employees.reduce(
        (total, employee) => total + calculateAmountPaid(employee._id),
        0
      );
    }
    return calculateAmountPaid(selectedEmployee);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Amount Owed</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            $
            {calculateTotalAmountOwed().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Paid So Far</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            $
            {calculateTotalAmountPaid().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Employees</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Payment
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No payments yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start by creating your first payment
          </p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Payment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {payment.employee?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {payment.amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {payment.description}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSave={handleCreatePayment}
          employees={employees}
        />
      )}
    </div>
  );
};

export default Payments;
