import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Creator } from '../Creators';

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
}

interface CostumeRequestModalProps {
  onClose: () => void;
  onSave: (request: CostumeRequest | Omit<CostumeRequest, 'id' | 'status'>) => void;
  creators: Creator[];
  request?: CostumeRequest | null;
  mode?: 'add' | 'edit';
}

const CostumeRequestModal: React.FC<CostumeRequestModalProps> = ({
  onClose,
  onSave,
  creators = [], // Provide default empty array
  request,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    subname: '',
    creator_id: '',
    costumenumber: '',
    videotype: '',
    videolength: '',
    subrequest: '',
    outfitdescription: '',
    payment: '',
    status: 'pending' as CostumeRequest['status'],
  });

  useEffect(() => {
    if (request && mode === 'edit') {
      setFormData({
        subname: request.subname,
        creator_id: request.creator_id,
        costumenumber: request.costumenumber,
        videotype: request.videotype || '',
        videolength: request.videolength || '',
        subrequest: request.subrequest || '',
        outfitdescription: request.outfitdescription || '',
        payment: request.payment.toString(),
        status: request.status,
      });
    }
  }, [request, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      ...formData,
      payment: parseFloat(formData.payment),
    };

    if (mode === 'edit' && request) {
      onSave({
        ...requestData,
        id: request.id,
      });
    } else {
      onSave(requestData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const costumeNumbers = [
    { value: 'first', label: 'First Costume' },
    { value: 'second', label: 'Second Costume' },
    { value: 'third', label: 'Third Costume' },
    { value: 'fourth', label: 'Fourth Costume' },
    { value: 'fifth', label: 'Fifth Costume' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === 'edit' ? 'Edit Costume Request' : 'Create New Costume Request'}
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
                  Sub Name *
                </label>
                <input
                  type="text"
                  name="subname"
                  required
                  value={formData.subname}
                  onChange={handleChange}
                  placeholder="Enter subscriber name"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creator *
                </label>
                <select
                  name="creator_id"
                  required
                  value={formData.creator_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select creator</option>
                  {creators.map(creator => (
                    <option key={creator.id} value={creator.id}>{creator.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Costume Number *
                </label>
                <select
                  name="costumenumber"
                  required
                  value={formData.costumenumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select costume number</option>
                  {costumeNumbers.map(costume => (
                    <option key={costume.value} value={costume.value}>
                      {costume.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Amount ($) *
                </label>
                <input
                  type="number"
                  name="payment"
                  required
                  min="0"
                  step="0.01"
                  value={formData.payment}
                  onChange={handleChange}
                  placeholder="Amount paid by subscriber"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video Type
                </label>
                <input
                  type="text"
                  name="videotype"
                  value={formData.videotype}
                  onChange={handleChange}
                  placeholder="E.g. Solo, JOI, etc."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video Length
                </label>
                <input
                  type="text"
                  name="videolength"
                  value={formData.videolength}
                  onChange={handleChange}
                  placeholder="E.g. 5 minutes, 10 minutes"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sub Request
              </label>
              <textarea
                name="subrequest"
                value={formData.subrequest}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed request from the subscriber"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Outfit Description
              </label>
              <textarea
                name="outfitdescription"
                value={formData.outfitdescription}
                onChange={handleChange}
                rows={4}
                placeholder="Description of the outfit requested"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

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
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
              >
                {mode === 'edit' ? 'Save Changes' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CostumeRequestModal;