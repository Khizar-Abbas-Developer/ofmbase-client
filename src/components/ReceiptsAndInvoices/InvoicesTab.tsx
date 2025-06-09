import React, { useState } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import InvoiceModal from "./InvoiceModal";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
}

const InvoicesTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sortField, setSortField] = useState<
    "date" | "number" | "amount" | "dueDate"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleCreateInvoice = (invoice: any) => {
    console.log(invoice);
    
    // const newInvoice = {
    //   id: Date.now().toString(),
    //   number: invoice.number,
    //   date: invoice.date,
    //   dueDate: invoice.dueDate,
    //   amount: invoice.items.reduce(
    //     (sum: number, item: any) => sum + item.amount,
    //     0
    //   ),
    //   status: "draft" as const,
    // };
    // setInvoices((prev) => [...prev, newInvoice]);
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

  const sortedInvoices = [...invoices].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "date":
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
        );
      case "dueDate":
        return (
          (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) *
          direction
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
          <button
            onClick={() => handleSort("dueDate")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Due Date{" "}
            {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No invoices yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first invoice to get started
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
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-50 text-green-700"
                          : invoice.status === "sent"
                          ? "bg-blue-50 text-blue-700"
                          : invoice.status === "overdue"
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <InvoiceModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateInvoice}
        />
      )}
    </div>
  );
};

export default InvoicesTab;
