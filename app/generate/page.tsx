import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ColdEmailGenerator from '@/components/ColdEmailGenerator'

export default function GeneratePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ColdEmailGenerator />
      </ProtectedRoute>
    </AuthProvider>
  )
} 