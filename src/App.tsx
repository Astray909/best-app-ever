import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const FoodIdeasPage = lazy(() => import('./pages/FoodIdeasPage'))
const BdayPage = lazy(() => import('./pages/BdayPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Layout />}>
              <Route index element={<HomePage />} />
              {/* Future protected routes go here */}
            </Route>
            <Route path="/foodIdeas" element={<Layout />}>
              <Route index element={<FoodIdeasPage />} />
            </Route>
            <Route path="/bday" element={<Layout />}>
              <Route index element={<BdayPage />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
