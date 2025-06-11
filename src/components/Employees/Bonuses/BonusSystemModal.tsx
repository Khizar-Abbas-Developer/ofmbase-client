import React, { useState, useEffect } from "react";
import { X, DollarSign, TrendingUp, Gift, Percent } from "lucide-react";
import type { Employee } from "../index";

interface BonusSystem {
  id: string;
  name: string;
  threshold_amount: number;
  bonus_amount: number;
  bonus_type: "fixed" | "percentage";
  employee_id?: string;
}

interface BonusSystemModalProps {
  onClose: () => void;
  onSave: (bonusSystem: Omit<BonusSystem, "id">) => void;
  bonusSystem?: BonusSystem;
  employees: Employee[];
}

const BonusSystemModal: React.FC<BonusSystemModalProps> = ({
  onClose,
  onSave,
  bonusSystem,
  employees,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    threshold_amount: "",
    bonus_amount: "",
    bonus_type: "fixed" as const,
    employee_id: "",
  });

  useEffect(() => {
    if (bonusSystem) {
      setFormData({
        name: bonusSystem.name,
        threshold_amount: bonusSystem.threshold_amount.toString(),
        bonus_amount: bonusSystem.bonus_amount.toString(),
        bonus_type: bonusSystem.bonus_type,
        employee_id: bonusSystem.employee_id || "",
      });
    }
  }, [bonusSystem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSave({
      name: formData.name,
      threshold_amount: parseFloat(formData.threshold_amount),
      bonus_amount: parseFloat(formData.bonus_amount),
      bonus_type: formData.bonus_type,
      employee_id: formData.employee_id || undefined,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        <div className="relative bg-white rounded-2xl max-w-md w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {bonusSystem ? "Edit Bonus System" : "Create New Bonus System"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-700">
              Create a bonus system to reward your employees when they reach
              specific sales targets. This helps motivate your team and drive
              better performance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-4 w-4 text-blue-500" />
                  Bonus System Name
                </div>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Monthly Sales Achievement Bonus"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Give your bonus system a clear, descriptive name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Sales Target to Achieve
                </div>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="threshold_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.threshold_amount}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                When an employee's sales reach or exceed this amount, they
                qualify for the bonus
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  Bonus Type
                </div>
              </label>
              <select
                name="bonus_type"
                value={formData.bonus_type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage of Sales</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Choose whether the bonus should be a fixed amount or a
                percentage of sales
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  {formData.bonus_type === "fixed" ? (
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Percent className="h-4 w-4 text-yellow-500" />
                  )}
                  Bonus Reward{" "}
                  {formData.bonus_type === "fixed" ? "Amount" : "Percentage"}
                </div>
              </label>
              <div className="relative">
                {formData.bonus_type === "fixed" ? (
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                ) : (
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                )}
                <input
                  type="number"
                  name="bonus_amount"
                  required
                  min="0"
                  step={formData.bonus_type === "fixed" ? "0.01" : "0.1"}
                  max={formData.bonus_type === "percentage" ? "100" : undefined}
                  value={formData.bonus_amount}
                  onChange={handleChange}
                  placeholder={formData.bonus_type === "fixed" ? "500" : "10"}
                  className={`w-full ${
                    formData.bonus_type === "fixed" ? "pl-9 pr-4" : "pl-4 pr-9"
                  } py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {formData.bonus_type === "fixed"
                  ? "The fixed bonus amount the employee will receive"
                  : "The percentage of sales the employee will receive as bonus"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assign to Employee (Optional)
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Leave unselected to apply this bonus system to all employees
              </p>
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
              >
                {bonusSystem ? "Save Changes" : "Create Bonus System"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BonusSystemModal;
