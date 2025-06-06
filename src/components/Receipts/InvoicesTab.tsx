import React from 'react';
import { Plus } from 'lucide-react';

const InvoicesTab = () => {
  return (
    <div>
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5" />
          Create Invoice
        </button>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No invoices yet</h3>
        <p className="text-slate-500 mb-6">Create your first invoice to get started</p>
      </div>
    </div>
  );
};

export default InvoicesTab;