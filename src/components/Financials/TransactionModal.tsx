import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Creator } from "../../App";
import { Employee } from "../Employees";
import { useAppSelector } from "../../redux/hooks";
import { ClipLoader } from "react-spinners";

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
  _id: string;
}

interface TransactionModalProps {
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  transaction?: Transaction | null;
  creators: Creator[];
  employees: Employee[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  onClose,
  onSave,
  transaction,
  creators,
  employees,
}) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "",
    creator_id: "",
    employee_id: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().split("T")[0],
        type: transaction.type,
        category: transaction.category,
        creator_id: transaction.creator_id || "",
        employee_id: transaction.employee_id || "",
        amount: transaction.amount.toString(),
        description: transaction.description,
      });
    }
  }, [transaction]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const requiredId =
      currentUser?.ownerId === "Agency Owner itself"
        ? currentUser?.id
        : currentUser?.ownerId;
    const transactionData = {
      id: transaction?.id || Date.now().toString(),
      date: new Date(formData.date).toISOString(),
      type: formData.type as "income" | "expense",
      category: formData.category,
      entity: formData.creator_id
        ? "creator"
        : formData.employee_id
        ? "employee"
        : "agency",
      description: formData.description,
      amount: parseFloat(formData.amount),
      ownerId: requiredId,
      creator_id: formData.creator_id || undefined,
      employee_id: formData.employee_id || undefined,
      _id: transaction?._id,
    };

    await onSave(transactionData); // <-- Ensure onSave is a promise-returning function
    onClose(); // Optional: Close the modal after successful save    } catch (error) {
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-lg w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="creator earnings">Creator Earnings</option>
                <option value="creator expense">Creator Expense</option>
                <option value="salary">Salary</option>
                <option value="equipment">Equipment</option>
                <option value="software">Software</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Creator (optional)
              </label>
              <select
                name="creator_id"
                value={formData.creator_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select creator</option>
                {creators.map((creator) => (
                  <option key={creator._id} value={creator._id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee (optional)
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
              >
                {loading ? (
                  <div className="flex justify-center items-center gap-2">
                    <p>{transaction ? "Save Changes" : "Add Transaction"}</p>
                    <ClipLoader size={14} color="white" />
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-2">
                    <p>{transaction ? "Save Changes" : "Add Transaction"}</p>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
