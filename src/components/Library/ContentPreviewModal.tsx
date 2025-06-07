import React, { useState } from "react";
import { X, Download, Trash2 } from "lucide-react";

interface RawContent {
  _id: string;
  fileName: string;
  type?: string;
  media_urls?: string[];
  content_urls?: string[];
  creatorName?: string;
  contentType?: string;
}

interface ContentPreviewModalProps {
  content: RawContent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDownload: (item: ContentItem) => void;
  typeOfTheURL: "content" | "media";
}

const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  content,
  onClose,
  onDelete,
  onDownload,
  typeOfTheURL,
}) => {  
  const { _id, fileName, type, media_urls, content_urls } = content;
  const fileUrl = typeOfTheURL === "content" ? content_urls[0] : media_urls;
  interface ContentItem {
    media_urls?: string[];
    content_urls?: string[];
    fileName: string; // Corrected key
  }
  const handleDownloadContent = (
    item: ContentItem,
    typeOfTheUrl: "content" | "media"
  ) => {
    const url = item.content_urls?.[0] || item.media_urls?.[0];
    if (!url) {
      console.error("No downloadable URL found.");
      return;
    }

    // Try to force download via blob for better compatibility
    fetch(url, { mode: "cors" }) // make sure the URL allows CORS if cross-origin
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.fileName; // ✅ Correct file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Download failed", err);
      });
  };

  const renderPreview = () => {
    if (type) {
      if (type.startsWith("image/")) {
        return (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-[60vh] object-contain mx-auto rounded-lg"
          />
        );
      }

      if (type.startsWith("video/")) {
        return (
          <video
            src={fileUrl}
            controls
            className="max-h-[60vh] w-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      }

      if (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".doc") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".ppt") ||
        fileName.endsWith(".pptx")
      ) {
        return (
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-[60vh] rounded-lg"
          ></iframe>
        );
      }
    }

    if (content.contentType) {
      if (content.contentType.startsWith("image/")) {
        return (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-[60vh] object-contain mx-auto rounded-lg"
          />
        );
      }

      if (content.contentType.startsWith("video/")) {
        return (
          <video
            src={fileUrl}
            controls
            className="max-h-[60vh] w-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      }

      if (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".doc") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".ppt") ||
        fileName.endsWith(".pptx")
      ) {
        return (
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-[60vh] rounded-lg"
          ></iframe>
        );
      }
    }

    return (
      <div className="flex items-center justify-center h-60 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Preview not available</p>
      </div>
    );
  };
  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 truncate">
                {fileName}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">{renderPreview()}</div>

            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => onDelete(_id)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
              <button
                onClick={() => handleDownloadContent(content, "content")}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
              >
                <Download className="h-5 w-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentPreviewModal;
