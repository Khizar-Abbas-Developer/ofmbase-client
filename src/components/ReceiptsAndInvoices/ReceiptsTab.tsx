import React, { useState } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import ReceiptModal from "./ReceiptModal";

interface Receipt {
  id: string;
  number: string;
  date: string;
  amount: number;
  paymentMethod: string;
}

const ReceiptsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [sortField, setSortField] = useState<"date" | "number" | "amount">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleCreateReceipt = (receipt: any) => {
    console.log(receipt);
    const newReceipt = {
      id: Date.now().toString(),
      number: receipt.number,
      date: receipt.date,
      amount: receipt.items.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.amount) || 0),
        0
      ),
      paymentMethod: receipt.paymentMethod,
    };

    setReceipts((prev) => [...prev, newReceipt]);
    setShowModal(false);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedReceipts = [...receipts].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "date":
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
        );
      case "number":
        return a.number.localeCompare(b.number) * direction;
      case "amount":
        return (a.amount - b.amount) * direction;
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => handleSort("date")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("number")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Number{" "}
            {sortField === "number" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("amount")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Amount{" "}
            {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Receipt
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No receipts yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first receipt to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {receipt.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(receipt.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    ${receipt.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {receipt.paymentMethod
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ReceiptModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateReceipt}
        />
      )}
    </div>
  );
};

export default ReceiptsTab;
