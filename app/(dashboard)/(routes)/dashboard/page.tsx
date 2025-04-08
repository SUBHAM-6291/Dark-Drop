'use client'
import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import UploadSidebarContent from '@/app/_components/dashboard/uploadsidebar'

const Page = () => {
  const [activeSection, setActiveSection] = useState('Upload Files')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const menuItems = [
    { label: 'Upload Files', icon: '⬆️' },
    { label: 'Shared Files', icon: '📤' },
    { label: 'Settings', icon: '⚙️' },
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleUploadSuccess = (urls: string[]) => {
    setUploadedImageUrls((prev) => [...prev, ...urls])
  }

  return (
    <div className="flex min-h-screen w-full bg-black text-white font-sans">
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-black text-white border-r border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-64`}
      >
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
          <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">DarkDrop</h1>
          <p className="text-sm text-gray-300 mt-2 italic font-light">
            "Unleash Files in the Shadows"
          </p>
        </div>

        <div className="p-4 bg-black">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveSection(item.label)
                  setIsSidebarOpen(false)
                }}
                className={`w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-white
                  ${activeSection === item.label ? 'bg-gray-800 shadow-inner' : ''}`}
              >
                <span className="text-gray-400 text-lg">{item.icon}</span>
                <span className="text-white font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-black text-gray-400 text-xs">
          <p>© 2025 DarkDrop Inc.</p>
          <p>v1.0.0</p>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="flex-1 p-8 bg-black w-full h-full overflow-auto">
        <button
          className="md:hidden fixed top-4 left-4 z-50 text-white text-2xl"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>

        <div className="flex flex-col h-full w-full">
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
            DarkDrop
          </h1>
          <p className="text-lg text-gray-200 mb-8 font-light italic">
            "Where Secrets Find Their Wings"
          </p>

          <div className="mt-6 flex-1 flex flex-col w-full">
            {activeSection === 'Upload Files' ? (
              <UploadSidebarContent imageUrls={uploadedImageUrls} onUploadSuccess={handleUploadSuccess} />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">{activeSection}</h2>
                <p className="text-gray-400">Coming soon to the shadows...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f1f1f',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
    </div>
  )
}

export default Page