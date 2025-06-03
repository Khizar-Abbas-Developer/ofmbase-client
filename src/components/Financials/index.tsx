import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TransactionModal from "./TransactionModal";
import { Creator } from "../../App";
import { Employee } from "../Employees";
import { useAppSelector } from "../../redux/hooks";
import axios from "axios";

interface FinancialsProps {
  creators?: Creator[];
  employees?: Employee[];
}

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  entity: string;
  description: string;
  amount: number;
  creator_id?: string;
  employee_id?: string;
  created_at?: string;
  updated_at?: string;
  creator?: {
    name: string;
  };
  employee?: {
    name: string;
  };
}

const Financials: React.FC<FinancialsProps> = () => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [creators, setCreators] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { currentUser } = useAppSelector((state) => state.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [creatorFilter, setCreatorFilter] = useState<string>("agency");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCreators = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/creator/get-creators/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setCreators(response.data.creators || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };
  const fetchEmployees = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/employee/get-employee/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCreators();
    fetchEmployees();
  }, [creatorFilter]);

  const fetchTransactions = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/finance/fetch-finance/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await axios.post(
        `${URL}/api/finance/create-finance`,
        transaction,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      fetchTransactions();
      setSelectedTransaction(null);
      setTransactions((prev) => [response.data.data, ...prev]);
      setShowTransactionModal(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      const response = await axios.patch(
        `${URL}/api/finance/update-finance/${transaction._id}`,
        transaction,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setTransactions((prev) =>
        prev.map((t) => (t._id === transaction._id ? response.data.data : t))
      );
      setShowTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await axios.delete(`${URL}/api/finance/delete-finance/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const filteredTransactions = transactions;

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Financials</h1>
        <button
          onClick={() => {
            setSelectedTransaction(null);
            setShowTransactionModal(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Net Profit
          </h3>
          <p
            className={`text-3xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${Math.abs(netProfit).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-slate-500">Total Income</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            ${totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-medium text-slate-500">
              Total Expenses
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="agency">Agency (All)</option>
              {creators.map((creator) => (
                <option key={creator._id} value={creator._id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Entity
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {transaction.creator?.name ||
                      transaction.employee?.name ||
                      transaction.entity}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No transactions yet
              </h3>
              <p className="text-slate-500 mb-6">
                Add your first transaction to get started
              </p>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Add Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {showTransactionModal && (
        <TransactionModal
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
          onSave={
            selectedTransaction ? handleEditTransaction : handleAddTransaction
          }
          transaction={selectedTransaction}
          creators={creators}
          employees={employees}
        />
      )}
    </div>
  );
};

export default Financials;
