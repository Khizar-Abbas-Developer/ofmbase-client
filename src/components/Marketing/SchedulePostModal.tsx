import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Creator } from '../../App';

interface SchedulePostModalProps {
  onClose: () => void;
  onSave: (post: {
    title: string;
    description: string;
    creator_id: string;
    platform: string;
    scheduled_date: string;
  }) => void;
  selectedDate: Date;
  creators: Creator[];
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  onClose,
  onSave,
  selectedDate,
  creators,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creator: '',
    platform: '',
    scheduledDate: selectedDate.toISOString().split('T')[0],
    scheduledTime: '12:00',
  });
  const [media, setMedia] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    onSave({
      title: formData.title,
      description: formData.description,
      creator_id: formData.creator,
      platform: formData.platform,
      scheduled_date: scheduledDateTime.toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-lg w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Schedule New Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Creator
              </label>
              <select
                name="creator"
                required
                value={formData.creator}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select creator</option>
                {creators.map(creator => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platform
              </label>
              <select
                name="platform"
                required
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select platform</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post description or caption..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Media
              </label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />
                <p className="text-sm text-slate-600">
                  Upload a file (PNG, JPG, GIF, MP4 up to 10MB)
                </p>
              </div>
              {media.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600">Selected files:</p>
                  <ul className="mt-1 space-y-1">
                    {media.map((file, index) => (
                      <li key={index} className="text-sm text-slate-600">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  required
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
                Schedule Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchedulePostModal;