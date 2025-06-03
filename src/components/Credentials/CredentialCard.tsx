import React, { useState } from "react";
import { Eye, EyeOff, Copy, Check, Trash } from "lucide-react";

interface CredentialCardProps {
  platform: string;
  username: string;
  password: string;
  notes?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  platform,
  username,
  password,
  notes,
  onEdit,
  onDelete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<"username" | "password" | null>(null);

  const handleCopy = async (text: string, field: "username" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{platform}</h3>
        <div className="flex gap-6">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Trash color="red" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">
            Username
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{username}</span>
            <button
              onClick={() => handleCopy(username, "username")}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {copied === "username" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">
            Password
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">
              {showPassword ? password : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleCopy(password, "password")}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {copied === "password" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {notes && (
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              Notes
            </label>
            <p className="text-sm text-slate-600">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialCard;
