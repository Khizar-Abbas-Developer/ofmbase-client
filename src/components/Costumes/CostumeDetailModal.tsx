import React from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';

interface CostumeRequest {
  id: string;
  subname: string;
  creator_id: string;
  costumenumber: string;
  videotype?: string;
  videolength?: string;
  subrequest?: string;
  outfitdescription?: string;
  payment: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  creator?: {
    name: string;
  };
}

interface CostumeDetailModalProps {
  request: CostumeRequest;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CostumeDetailModal: React.FC<CostumeDetailModalProps> = ({
  request,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Costume Request Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{request.subname}</h3>
                <p className="text-sm text-slate-500">
                  Created on {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === 'pending'
                  ? 'bg-yellow-50 text-yellow-800'
                  : request.status === 'approved'
                  ? 'bg-blue-50 text-blue-800'
                  : request.status === 'completed'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Creator</h4>
                <p className="text-sm text-slate-600">{request.creator?.name || 'Not assigned'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Payment</h4>
                <p className="text-sm text-slate-600">${request.payment}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Costume Number</h4>
                <p className="text-sm text-slate-600">{request.costumenumber}</p>
              </div>
              {request.videotype && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Video Type</h4>
                  <p className="text-sm text-slate-600">{request.videotype}</p>
                </div>
              )}
              {request.videolength && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Video Length</h4>
                  <p className="text-sm text-slate-600">{request.videolength}</p>
                </div>
              )}
            </div>

            {request.subrequest && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Subscriber Request</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{request.subrequest}</p>
              </div>
            )}

            {request.outfitdescription && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Outfit Description</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{request.outfitdescription}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
            >
              <Trash2 className="h-5 w-5" />
              Delete Request
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
            >
              <Pencil className="h-5 w-5" />
              Edit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostumeDetailModal;