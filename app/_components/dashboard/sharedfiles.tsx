"use client";

import React from "react";
import toast from "react-hot-toast";
import { api } from "@/app/Backend/services/axios"; // Standardized import path

interface SharedFile {
  url: string;
  filename: string;
  date: string;
}

interface SharedFilesContentProps {
  sharedFiles: SharedFile[];
  onDelete: (url: string) => void;
  isLoading?: boolean;
}

const SharedFilesContent: React.FC<SharedFilesContentProps> = ({
  sharedFiles,
  onDelete,
  isLoading = false,
}) => {
  const [editableFiles, setEditableFiles] = React.useState<SharedFile[]>(sharedFiles);
  const [editingUrl, setEditingUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEditableFiles(sharedFiles); // Sync local state with prop changes
  }, [sharedFiles]);

  const handleEditStart = (url: string) => {
    setEditingUrl(url); // Start editing mode for this file
  };

  const handleEditChange = (url: string, newFilename: string) => {
    setEditableFiles((prev) =>
      prev.map((file) =>
        file.url === url ? { ...file, filename: newFilename } : file
      )
    ); // Update filename in local state
  };

  const handleEditSave = async (url: string) => {
    const newFilename = editableFiles.find((f) => f.url === url)?.filename;
    if (newFilename) {
      try {
        await api.updateSharedFileName(url, newFilename); // Use centralized api method
        toast.success("Filename updated successfully", {
          style: { background: "#1f1f1f", color: "#22c55e" },
        });
        setEditingUrl(null); // Exit editing mode
      } catch (error: any) {
        console.error("Error saving filename:", error);
        toast.error(error.message || "Failed to update filename", {
          style: { background: "#1f1f1f", color: "#ef4444" },
        });
        setEditableFiles(sharedFiles); // Revert to original state on error
      }
    }
  };

  return (
    <div className="p-6 bg-black text-white space-y-8 rounded-xl shadow-2xl border border-gray-900">
      <div className="text-center">
        <h3 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Shared Files
        </h3>
        <p className="text-sm text-gray-300 italic mt-2">
          "Echoes of the Abyss Unveiled"
        </p>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center animate-pulse">Loading files...</p>
      ) : editableFiles.length > 0 ? (
        <ul className="space-y-6">
          {editableFiles.map((file, index) => (
            <li
              key={file.url}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gray-950 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-800"
            >
              <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                <span className="text-gray-400 font-semibold text-lg">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  {editingUrl === file.url ? (
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={file.filename}
                        onChange={(e) => handleEditChange(file.url, e.target.value)}
                        className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(file.url)}
                        className="bg-gray-800 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 ease-in-out border border-gray-700 hover:border-blue-700 text-sm"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 truncate max-w-[200px] sm:max-w-xs transition-colors duration-200 hover:underline"
                      >
                        {file.filename}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded: {new Date(file.date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-3 sm:mt-0">
                <button
                  onClick={() => handleEditStart(file.url)}
                  className="bg-gray-800 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 ease-in-out border border-gray-700 hover:border-blue-700 text-sm"
                >
                  Set Name
                </button>
                <button
                  onClick={() => onDelete(file.url)}
                  className="bg-gray-800 hover:bg-red-800 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 ease-in-out border border-gray-700 hover:border-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-center italic text-lg">
          No files shared yet. Unleash the darkness!
        </p>
      )}
    </div>
  );
};

export default SharedFilesContent;