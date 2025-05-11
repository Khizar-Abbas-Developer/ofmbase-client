import React from 'react';
import { X, Download } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  platform: string;
  scheduled_date: string;
  media_urls?: string[];
  creator?: {
    name: string;
  };
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
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
          alt="Post content"
          className="max-h-48 w-full object-cover rounded-lg"
        />
      );
    }
    
    if (isVideo(url)) {
      return (
        <video 
          src={url} 
          controls 
          className="max-h-48 w-full rounded-lg"
        >
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
            <h2 className="text-xl font-semibold text-slate-800">Post Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{post.title}</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{post.description}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Scheduled for:</span>
                <span className="text-sm text-slate-600">
                  {new Date(post.scheduled_date).toLocaleString()}
                </span>
              </div>
              {post.creator && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Creator:</span>
                  <span className="text-sm text-slate-600">{post.creator.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Platform:</span>
                <span className="text-sm text-slate-600">{post.platform}</span>
              </div>
            </div>

            {post.media_urls && post.media_urls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-4">Media Files</h4>
                <div className="grid grid-cols-2 gap-4">
                  {post.media_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      {renderMediaPreview(url)}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <Download className="h-5 w-5 text-slate-700" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;