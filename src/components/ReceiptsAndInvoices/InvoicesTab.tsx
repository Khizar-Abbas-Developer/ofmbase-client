import { useEffect, useState } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import InvoiceModal from "./InvoiceModal";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import toast from "react-hot-toast";

interface Invoice {
  _id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  paymentMethod: string;
}

const InvoicesTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sortField, setSortField] = useState<
    "date" | "number" | "amount" | "dueDate"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleCreateInvoice = async (invoice: any) => {
    const totalAmount = invoice.items?.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0
    );
    try {
      const requierdId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const dataToSend = {
        ...invoice,
        ownerId: requierdId,
        amount: totalAmount,
      };
      const response = await axios.post(
        `${URL}/api/invoices/create-invoice`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setInvoices((prev) => [...prev, response.data]);
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
  };

  const handleFetchInvoices = async () => {
    try {
      const requierdId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/invoices/fetch-invoices/${requierdId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setInvoices(response.data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchInvoices();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortField) return 0;
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
        return (a.number || "").localeCompare(b.number || "") * direction;
      case "amount":
        return ((a.amount || 0) - (b.amount || 0)) * direction;
      default:
        return 0;
    }
  });

  const flatInvoices = sortedInvoices.flat(); // or flat(1)

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => handleSort("date")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Date{" "}
                {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("number")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Number{" "}
                {sortField === "number" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("amount")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Amount{" "}
                {sortField === "amount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("dueDate")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Due Date{" "}
                {sortField === "dueDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
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
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flatInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.number || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.date
                          ? new Date(invoice.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        $
                        {!isNaN(Number(invoice.amount))
                          ? Number(invoice.amount).toFixed(2)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700">
                          {invoice.paymentMethod
                            .replace(/_/g, " ")
                            .toUpperCase()}
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
      )}
    </>
  );
};

export default InvoicesTab;
