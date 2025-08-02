import dynamicImport from 'next/dynamic'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ColdEmailGenerator from '@/components/ColdEmailGenerator'
import HeroPage from '@/components/HeroPage'

const Toaster = dynamicImport(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
})

// Force dynamic rendering to prevent static generation and caching
export const dynamic = 'force-dynamic'

// Add cache control headers
export async function generateMetadata() {
  return {
    other: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
}

export default function Home() {
  // Add a version parameter to force cache busting
  const version = Date.now()
  
  return (
    <AuthProvider>
      <div data-version={version}>
        <HeroPage />
        <Toaster />
      </div>
    </AuthProvider>
  )
} 