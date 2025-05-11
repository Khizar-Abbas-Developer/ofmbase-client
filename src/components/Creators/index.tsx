import React, { useState } from 'react';
import { Plus, Search, Users, Pencil, Trash2 } from 'lucide-react';
import CreatorModal from './CreatorModal';
import CreatorDetailModal from './CreatorDetailModal';
import { Creator } from './index';

interface CreatorsProps {
  creators: Creator[];
  onAdd: (creator: Omit<Creator, 'id'>) => void;
  onUpdate: (creator: Creator) => void;
  onDelete: (id: string) => void;
}

const Creators: React.FC<CreatorsProps> = ({
  creators = [], // Provide default empty array
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const openCreatorModal = (mode: 'add' | 'edit' | 'view', creator?: Creator) => {
    setModalMode(mode);
    setSelectedCreator(creator || null);
    setIsModalOpen(true);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCardClick = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowDetailModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Creators</h1>
          <p className="text-slate-500 mt-1">Manage your agency's creators</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search creators..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <button
            onClick={() => openCreatorModal('add')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
          >
            <Plus className="h-5 w-5" />
            Add Creator
          </button>
        </div>
      </div>

      {!Array.isArray(creators) || creators.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No creators yet</h3>
          <p className="text-slate-500 mb-6">Get started by adding your first creator</p>
          <button
            onClick={() => openCreatorModal('add')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
          >
            <Plus className="h-5 w-5" />
            Add Creator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map(creator => (
            <div
              key={creator.id}
              onClick={() => handleCardClick(creator)}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-slate-800 truncate">{creator.name}</h3>
                  <p className="text-sm text-slate-500">{creator.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleActionClick(e, () => openCreatorModal('edit', creator))}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, () => onDelete(creator.id))}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {creator.age && (
                  <p className="text-sm text-slate-600">Age: {creator.age}</p>
                )}
                {creator.country && (
                  <p className="text-sm text-slate-600">Country: {creator.country}</p>
                )}
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
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreatorModal
          mode={modalMode}
          creator={selectedCreator}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCreator(null);
          }}
          onSave={modalMode === 'add' ? onAdd : onUpdate}
        />
      )}

      {showDetailModal && selectedCreator && (
        <CreatorDetailModal
          creator={selectedCreator}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCreator(null);
          }}
        />
      )}
    </div>
  );
};

export default Creators;