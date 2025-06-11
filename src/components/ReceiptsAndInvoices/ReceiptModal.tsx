import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface ReceiptModalProps {
  onClose: () => void;
  onSave: (receipt: any) => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    number: "",
    items: [{ description: "", amount: "" }],
    paymentMethod: "bank_transfer",
    bankTransfer: {
      confirmationNumber: "",
    },
    paypal: {
      transactionId: "",
    },
    creditCard: {
      last4: "",
      brand: "",
    },
    cash: {
      receivedFrom: "",
    },
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSave(formData);
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

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: e.target.value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "" }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);

  const renderPaymentFields = () => {
    switch (formData.paymentMethod) {
      case "bank_transfer":
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmation Number
            </label>
            <input
              type="text"
              name="bankTransfer.confirmationNumber"
              value={formData.bankTransfer.confirmationNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bankTransfer: { confirmationNumber: e.target.value },
                }))
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "paypal":
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              name="paypal.transactionId"
              value={formData.paypal.transactionId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paypal: { transactionId: e.target.value },
                }))
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "credit_card":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                name="creditCard.last4"
                value={formData.creditCard.last4}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creditCard: { ...prev.creditCard, last4: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Card Brand
              </label>
              <select
                name="creditCard.brand"
                value={formData.creditCard.brand}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creditCard: { ...prev.creditCard, brand: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select brand</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>
          </div>
        );

      case "cash":
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Received From
            </label>
            <input
              type="text"
              name="cash.receivedFrom"
              value={formData.cash.receivedFrom}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cash: { receivedFrom: e.target.value },
                }))
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Create Receipt
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
                  Receipt Number
                </label>
                <input
                  type="text"
                  name="number"
                  required
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="REC-001"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Items
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Description"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(index, "amount", e.target.value)
                        }
                        placeholder="Amount"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end border-t border-slate-200 pt-4">
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-700">
                      Total:
                    </span>
                    <span className="ml-2 text-lg font-bold text-slate-900">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>

              {renderPaymentFields()}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
              >
                Create Receipt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
