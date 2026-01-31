import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Alerts from './pages/Alerts'
import Hospitals from './pages/Hospitals'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/auth/Signup'
import LandingPage from './pages/LandingPage'
import HospitalDashboard from './pages/dashboards/HospitalDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AgentControlRoom from './pages/AgentControlRoom'

import ChatWidget from './components/ChatWidget'
import ProtectedRoute from './components/ProtectedRoute'

// Layout wrapper for authenticated pages
const MainLayout: React.FC<{
  children: React.ReactNode,
  onToggleDarkMode: () => void,
  isDarkMode: boolean,
  isSidebarOpen: boolean,
  toggleSidebar: () => void,
  closeSidebar: () => void
}> = ({
  children,
  onToggleDarkMode,
  isDarkMode,
  isSidebarOpen,
  toggleSidebar,
  closeSidebar
}) => {
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
      if (window.innerWidth < 768) {
        closeSidebar();
      }
    }, [location, closeSidebar]);

    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}

        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} w-full`}>
          <Navbar
            onToggleDarkMode={onToggleDarkMode}
            isDarkMode={isDarkMode}
            onToggleSidebar={toggleSidebar}
          />
          <main className="custom-scrollbar min-h-[calc(100vh-4rem)] overflow-auto">
            {children}
          </main>
        </div>
        <ChatWidget />
      </div>
    )
  }

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Check screen size on mount
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Apply dark mode class on mount
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
        <Route path="/login" element={<Login isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
        <Route path="/signup" element={<Signup isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />

        {/* Public Agent Control Room */}
        <Route path="/agent-control" element={<AgentControlRoom />} />

        {/* Protected Routes - Dashboards */}

        <Route
          path="/dashboard/hospital"
          element={
            <ProtectedRoute>
              <MainLayout
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
              >
                <HospitalDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <MainLayout
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
              >
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Other Protected Pages (Legacy/Shared) */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <MainLayout
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
              >
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospitals"
          element={
            <ProtectedRoute>
              <MainLayout
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
              >
                <Hospitals />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
              >
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
