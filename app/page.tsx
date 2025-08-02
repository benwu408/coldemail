import dynamic from 'next/dynamic'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ColdEmailGenerator from '@/components/ColdEmailGenerator'
import HeroPage from '@/components/HeroPage'

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
})

export default function Home() {
  return (
    <AuthProvider>
      <HeroPage />
      <Toaster />
    </AuthProvider>
  )
} 