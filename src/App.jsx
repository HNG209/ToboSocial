
import { Outlet } from 'react-router-dom'
import BottomNav from './components/layout/bottomNav'
import Sidebar from './components/layout/sidebar'
import Home from './pages/Home'

function App() {

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </>
  )
}

export default App
