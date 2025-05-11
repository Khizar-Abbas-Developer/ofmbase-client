import React from 'react';
import { X } from 'lucide-react';
import { Creator } from './index';

interface CreatorDetailModalProps {
  creator: Creator;
  onClose: () => void;
}

const CreatorDetailModal: React.FC<CreatorDetailModalProps> = ({ creator, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">{creator.name}</h2>
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
                <p className="text-sm text-slate-600">Email: {creator.email}</p>
                {creator.age && <p className="text-sm text-slate-600">Age: {creator.age}</p>}
                {creator.country && <p className="text-sm text-slate-600">Country: {creator.country}</p>}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    creator.status === 'active' ? 'bg-green-50 text-green-700' :
                    creator.status === 'invited' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {creator.status.charAt(0).toUpperCase() + creator.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {creator.bio && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Bio</h3>
                <p className="text-sm text-slate-600">{creator.bio}</p>
              </div>
            )}

            {creator.hobbies && creator.hobbies.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {creator.address && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Address</h3>
                <div className="space-y-1">
                  {creator.address.street && (
                    <p className="text-sm text-slate-600">{creator.address.street}</p>
                  )}
                  <p className="text-sm text-slate-600">
                    {[
                      creator.address.city,
                      creator.address.state,
                      creator.address.postalCode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {creator.measurements && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Measurements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {creator.measurements.height && (
                    <p className="text-sm text-slate-600">Height: {creator.measurements.height}cm</p>
                  )}
                  {creator.measurements.weight && (
                    <p className="text-sm text-slate-600">Weight: {creator.measurements.weight}kg</p>
                  )}
                  {creator.measurements.shoeSize && (
                    <p className="text-sm text-slate-600">Shoe Size: {creator.measurements.shoeSize}</p>
                  )}
                  {creator.measurements.dressSize && (
                    <p className="text-sm text-slate-600">Dress Size: {creator.measurements.dressSize}</p>
                  )}
                  {creator.measurements.waist && (
                    <p className="text-sm text-slate-600">Waist: {creator.measurements.waist}cm</p>
                  )}
                  {creator.measurements.hips && (
                    <p className="text-sm text-slate-600">Hips: {creator.measurements.hips}cm</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDetailModal;