
import { Outlet } from 'react-router-dom'
import BottomNav from './components/layout/bottomNav'
import Sidebar from './components/layout/sidebar'
import Home from './pages/Home'
import ProfileProvider from './components/context/ProfileContext'
import UploadedImageProvider from './components/context/UploadedImageContext'
import NotificationWatcher from './components/utils/NotificationWatcher'
import { useEffect } from 'react'
import socket from './socket'
import { message } from 'antd'

function App() {

  return (
    <>
      <NotificationWatcher />
      <UploadedImageProvider>
        <ProfileProvider>
          <div className="flex flex-col md:flex-row h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <Outlet />
            </main>
            <BottomNav />
          </div>
        </ProfileProvider>
      </UploadedImageProvider>
    </>
  )
}

export default App
