import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { useAuth } from '@/hooks/useAuth'
import './App.css'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">MUNDERO</h2>
            <p className="text-gray-600">Cargando tu red profesional...</p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App