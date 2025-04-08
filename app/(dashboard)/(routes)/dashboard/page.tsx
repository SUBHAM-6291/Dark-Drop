'use client'
import React from 'react'
import axios from 'axios'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

// FileReceiveProp Component
const FileReceiveProp: React.FC<{ imageUrls?: string[] }> = ({ imageUrls }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])
  const [uploadResult, setUploadResult] = React.useState<{
    success: boolean;
    imageUrls?: string[];
    filecount?: number;
    error?: string;
  } | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) {
      return;
    }
    if (files.length > 5) {
      alert('Max 5 files allowed');
      return;
    }
    setSelectedFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setUploadResult(null); // Reset previous upload result
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert('No files selected');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await axios.post('/api/auth/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      setUploadResult(result);

      if (result.success) {
        setPreviewUrls([]);
        setSelectedFiles([]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      setUploadResult({ success: false, error: errorMessage });
    } finally {
      setIsUploading(false);
    }
  }

  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="p-5 bg-black text-white">
      <h3 className="text-xl font-semibold mb-4">Upload Your Files</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-gray-900 file:text-white
          hover:file:bg-gray-800
          mb-6"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 
          transition-colors mb-6 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </button>
      {previewUrls.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">File Previews:</h4>
          <div className="grid grid-cols-2 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index}>
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-900"
                />
                <p className="text-gray-400 mt-2">File: {selectedFiles[index]?.name}</p>
                <p className="text-gray-400">Size: {((selectedFiles[index]?.size ?? 0) / 1024).toFixed(2)} KB</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {uploadResult && (
        <div className="mt-4">
          <p className={uploadResult.success ? 'text-green-400' : 'text-red-400'}>
            {uploadResult.success
              ? `Successfully uploaded ${uploadResult.filecount} file(s)`
              : `Upload failed: ${uploadResult.error}`}
          </p>
          {uploadResult.imageUrls && (
            <ul className="mt-2 text-gray-400">
              {uploadResult.imageUrls.map((url, index) => (
                <li key={index}><a href={url} target="_blank" className="underline">{url}</a></li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!previewUrls.length && !uploadResult && (
        <p className="text-gray-500 italic">No files selected yet</p>
      )}
    </div>
  )
}

// Main Page Component
const Page = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black text-white">
        {/* Sidebar - Left Side with Black Theme */}
        <Sidebar className="bg-black text-white border-r border-gray-900 w-64 flex-shrink-0">
          <SidebarHeader className="p-6 border-b border-gray-900 bg-black">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">DarkDrop</h1>
            <p className="text-xs text-gray-500 mt-1">Secure File Sharing</p>
          </SidebarHeader>
          
          <SidebarContent className="p-4 bg-black">
            <SidebarGroup>
              <SidebarMenu>
                {[
                  { label: 'Dashboard', icon: '🏠' },
                  { label: 'Upload Files', icon: '⬆️' },
                  { label: 'Shared Files', icon: '📤' },
                  { label: 'History', icon: '📜' },
                  { label: 'Settings', icon: '⚙️' },
                ].map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-900 
                        transition-colors duration-200 flex items-center gap-2 bg-black text-white">
                        <span className="text-gray-400">{item.icon}</span>
                        <span className="text-gray-200 font-medium">{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-gray-900 bg-black">
            <p className="text-xs text-gray-500">© 2025 DarkDrop Inc.</p>
            <p className="text-xs text-gray-600">v1.0.0</p>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content - Full Right Side */}
        <main className="flex-1 p-8 bg-black w-full h-full overflow-auto">
          <div className="flex flex-col h-full w-full">
            <h1 className="text-4xl font-bold mb-2">Welcome to DarkDrop</h1>
            <p className="text-sm text-gray-400 mb-8">Fast. Secure. Simple File Sharing.</p>
            
            <div className="mt-6 flex-1 flex flex-col w-full">
              <h2 className="text-xl font-semibold mb-4">Upload Your Files</h2>
              <FileReceiveProp />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Page
export { FileReceiveProp }