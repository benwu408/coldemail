import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img 
              src="/reachful_logo.png" 
              alt="Reachful" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-[#111827]">
              Reachful
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-[#111827] transition-colors duration-200 font-medium">Terms</Link>
            <Link href="/privacy" className="hover:text-[#111827] transition-colors duration-200 font-medium">Privacy</Link>
            <Link href="/contact" className="hover:text-[#111827] transition-colors duration-200 font-medium">Contact</Link>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">X</a>
              <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>&copy; 2025 Reachful. Cold outreach that feels warm.</p>
        </div>
      </div>
    </footer>
  )
} 