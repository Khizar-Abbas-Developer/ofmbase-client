import React from 'react';
import { X, DollarSign, Clock } from 'lucide-react';
import { Employee } from './index';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">{employee.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Email: {employee.email}</p>
                <p className="text-sm text-slate-600">Role: {employee.role}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    employee.status === 'active' ? 'bg-green-50 text-green-700' :
                    employee.status === 'invited' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Payment Details</h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Base Rate: ${employee.hourly_rate}/hour
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Payment Schedule: {employee.payment_schedule}
                </p>
                <p className="text-sm text-slate-600">
                  Payment Method: {employee.payment_method}
                </p>
                {employee.payment_method === 'paypal' && employee.paypal_email && (
                  <p className="text-sm text-slate-600">
                    PayPal Email: {employee.paypal_email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Work Status</h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Current Status: {employee.status}
                </p>
                <p className="text-sm text-slate-600">
                  Role Type: {employee.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;