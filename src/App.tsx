import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<HomePage />} />
            {/* Future protected routes go here */}
          </Route>
          <Route element={<Layout />}>
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <NotFoundPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
