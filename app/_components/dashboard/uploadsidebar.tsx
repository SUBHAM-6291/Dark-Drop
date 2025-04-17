"use client";

import React from "react";
import toast from "react-hot-toast";
import { apiService } from "@/app/Backend/services/axios";

interface UploadSidebarContentProps {
  imageUrls?: string[];
  onUploadSuccess?: (urls: string[]) => void;
}

const UploadSidebarContent: React.FC<UploadSidebarContentProps> = ({ imageUrls, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    if (files.length > 10) {
      toast.error("Max 10 drops allowed", { style: { background: "#1f1f1f", color: "#fff" } });
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("No drops selected", { style: { background: "#1f1f1f", color: "#fff" } });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    try {
      const result = await apiService.uploadFiles(formData);

      if (result.success) {
        toast.success(`Dropped ${result.filecount} file(s) into the dark`, {
          style: { background: "#1f1f1f", color: "#22c55e" },
        });
        setUploadedUrls(result.imageUrls || []);
        setSelectedFiles([]);
        if (result.imageUrls && onUploadSuccess) {
          onUploadSuccess(result.imageUrls);
        }
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error: any) {
      toast.error(error.message || "Drop failed", {
        style: { background: "#1f1f1f", color: "#ef4444" },
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-black text-white space-y-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-extrabold text-white tracking-wide">
        DarkDrop Zone
      </h3>
      <p className="text-sm text-gray-400 italic">
        "Dive Deep, Drop Fearless"
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full text-gray-300 file:py-2 file:px-6 file:rounded-lg file:border-0 
          file:bg-gray-800 file:text-white file:font-semibold file:hover:bg-gray-700 
          file:transition-colors file:cursor-pointer"
      />

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`w-full py-3 bg-gray-900 text-white font-semibold rounded-lg 
          hover:bg-gray-800 transition-colors shadow-md 
          ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
      >
        {isUploading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-gray-300" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
            </svg>
            Dropping...
          </span>
        ) : (
          "Drop Now"
        )}
      </button>

      {(selectedFiles.length > 0 || uploadedUrls.length > 0) && (
        <div className="space-y-4">
          <p className="text-gray-200 font-semibold">
            {selectedFiles.length > 0 ? "Selected Files:" : "Uploaded URLs:"}
          </p>
          {selectedFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-gray-400 text-sm truncate">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                  <div className="relative w-full">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full max-h-64 object-contain rounded-lg shadow-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="text-sm space-y-2">
              {uploadedUrls.map((url, index) => (
                <li key={index} className="truncate">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selectedFiles.length && !uploadedUrls.length && (
        <p className="text-gray-500 text-center italic">No drops yet? Dive in!</p>
      )}
    </div>
  );
};

export default UploadSidebarContent;