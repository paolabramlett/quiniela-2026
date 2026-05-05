import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import LoginPage from './components/Auth/LoginPage'
import Dashboard from './components/Dashboard/Dashboard'
import PredictionsPage from './components/Predictions/PredictionsPage'
import LeaderboardPage from './components/Leaderboard/LeaderboardPage'
import GroupsPage from './components/Groups/GroupsPage'
import AdminPage from './components/Admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
