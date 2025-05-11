import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TimeEntry } from './TimeEntryModal';
import { Employee } from '../index';

interface TimeTrackingTableProps {
  timeEntries: TimeEntry[];
  employees: Employee[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({
  timeEntries,
  employees,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const formatSales = (sales?: { creator_id: string; amount: number }[]) => {
    if (!sales || sales.length === 0) return '-';
    return sales.map(sale => `$${sale.amount.toFixed(2)}`).join(', ');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Employee</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Hours</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Description</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Sales</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {timeEntries.map(entry => (
            <tr key={entry.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm text-slate-600">{formatDate(entry.date)}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{getEmployeeName(entry.employee_id)}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{entry.hours}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{entry.description}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{formatSales(entry.creator_sales)}</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTrackingTable;