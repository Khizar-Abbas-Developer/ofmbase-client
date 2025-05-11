import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Creator } from '../../App';

interface Credential {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes?: string;
  type: 'agency' | 'creator';
  creator_id?: string | null;
}

interface CredentialModalProps {
  type: 'agency' | 'creator';
  creators: Creator[];
  credential?: Credential | null;
  onClose: () => void;
  onSave: (credential: Credential | Omit<Credential, 'id'>) => void;
}

const CredentialModal: React.FC<CredentialModalProps> = ({
  type,
  creators,
  credential,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    password: '',
    notes: '',
    creator_id: null as string | null,
  });

  useEffect(() => {
    if (credential) {
      setFormData({
        platform: credential.platform,
        username: credential.username,
        password: credential.password,
        notes: credential.notes || '',
        creator_id: credential.creator_id || null,
      });
    }
  }, [credential]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const credentialData = {
      ...formData,
      type,
    };

    if (credential) {
      onSave({
        ...credentialData,
        id: credential.id,
      });
    } else {
      onSave(credentialData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-md w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {credential ? 'Edit' : 'Add'} {type === 'agency' ? 'Agency' : 'Creator'} Credentials
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {type === 'creator' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creator
                </label>
                <select
                  name="creator_id"
                  required
                  value={formData.creator_id || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select creator</option>
                  {creators.map(creator => (
                    <option key={creator.id} value={creator.id}>{creator.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platform
              </label>
              <input
                type="text"
                name="platform"
                required
                value={formData.platform}
                onChange={handleChange}
                placeholder="e.g. Instagram, Gmail, Adobe"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional information"
              />
            </div>

            <div className="flex justify-end gap-4">
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
                {credential ? 'Save Changes' : 'Add Credentials'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CredentialModal;