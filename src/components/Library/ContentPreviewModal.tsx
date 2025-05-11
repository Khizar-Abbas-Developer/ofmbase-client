import React from 'react';
import { X, Download, Trash2 } from 'lucide-react';

interface ContentPreviewModalProps {
  content: {
    id: string;
    name: string;
    type: string;
    url: string;
  };
  onClose: () => void;
  onDelete: (id: string) => void;
}

const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  content,
  onClose,
  onDelete,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = content.url;
    link.download = content.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (content.type.startsWith('image/')) {
      return (
        <img
          src={content.url}
          alt={content.name}
          className="max-h-[60vh] object-contain mx-auto rounded-lg"
        />
      );
    }

    if (content.type.startsWith('video/')) {
      return (
        <video
          src={content.url}
          controls
          className="max-h-[60vh] w-full rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="flex items-center justify-center h-60 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Preview not available</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-4xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 truncate">{content.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6">
            {renderPreview()}
          </div>

          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => onDelete(content.id)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
            >
              <Trash2 className="h-5 w-5" />
              Delete
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
            >
              <Download className="h-5 w-5" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewModal;