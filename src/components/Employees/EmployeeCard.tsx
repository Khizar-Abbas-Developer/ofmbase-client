import React from 'react';
import { Pencil, Trash2, DollarSign } from 'lucide-react';
import { Employee } from './index';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  onClick,
}) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-500">{employee.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleActionClick(e, onEdit)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-150"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onDelete)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors duration-150"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">Role: {employee.role}</p>
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Rate: ${employee.hourly_rate}/hr
        </p>
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
  );
};

export default EmployeeCard;