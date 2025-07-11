import React from "react";
import { X, Download, Trash2, Calendar, User } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface RequestPreviewModalProps {
  request: {
    _id: string;
    url?: string;
    uploadDate: string;
    name: string;
    type: string;
  };
  onClose: () => void;
  onDelete: (id: string) => void;
  handleDownload: (item: any) => void;
  deletingDocument: boolean;
  downloadingDocument: boolean;
}

const DocumentPreviewModal: React.FC<RequestPreviewModalProps> = ({
  request,
  onClose,
  onDelete,
  deletingDocument,
  handleDownload,
  downloadingDocument,
}) => {
  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const renderMediaPreview = (url: string) => {
    if (isImage(url)) {
      return (
        <img
          src={url}
          alt="Reference content"
          className="max-h-[100%] w-full object-contain rounded-lg"
        />
      );
    }

    if (isVideo(url)) {
      return (
        <video src={url} controls className="max-h-48 w-full rounded-lg">
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Preview not available</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Document Preview
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Uploaded Date:{" "}
                  {new Date(request.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {request.url && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-4">
                  {request.name}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                    {renderMediaPreview(request.url)}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg"
                      onClick={() => handleDownload(request)}
                    >
                      {downloadingDocument ? (
                        <ClipLoader size={20} color="green" />
                      ) : (
                        <Download className="h-5 w-5 text-slate-700" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => onDelete(request._id)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
            >
              {deletingDocument ? (
                <>
                  <ClipLoader size={14} color="red" />
                  Please waite
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Delete Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
