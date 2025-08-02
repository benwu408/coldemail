import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ColdEmailGenerator from '@/components/ColdEmailGenerator'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function GeneratePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ColdEmailGenerator />
      </ProtectedRoute>
    </AuthProvider>
  )
} 