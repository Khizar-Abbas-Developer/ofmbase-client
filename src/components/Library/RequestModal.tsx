import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RequestModalProps {
  onClose: () => void;
  onSave: (request: {
    title: string;
    description: string;
    due_date: string;
    creator_id?: string;
    media_urls?: string[];
  }) => void;
  creators: { id: string; name: string }[];
  folder?: { id: string; name: string } | null;
}

const RequestModal: React.FC<RequestModalProps> = ({
  onClose,
  onSave,
  creators,
  folder,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(folder ? `Folder: ${folder.name}\n\n` : '');
  const [dueDate, setDueDate] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Upload files and get URLs
      const mediaUrls = await Promise.all(
        files.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `content-requests/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Update progress
          setUploadProgress(((index + 1) / files.length) * 100);

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      onSave({
        title,
        description,
        due_date: dueDate,
        creator_id: selectedCreator || undefined,
        media_urls: mediaUrls,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validate file types
      const validFiles = selectedFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        return isImage || isVideo;
      });

      if (validFiles.length !== selectedFiles.length) {
        alert('Only image and video files are allowed');
      }

      setFiles(validFiles);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Request Content from Creator</h2>
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
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a creator</option>
                {creators.map(creator => (
                  <option key={creator.id} value={creator.id}>{creator.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Instagram post for product launch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what you need, including any specific requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reference Files
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,video/*"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 text-center">
                  Uploading files... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

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
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;