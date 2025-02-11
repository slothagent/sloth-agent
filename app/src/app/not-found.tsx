import Link from 'next/link'


export default function NotFound() {
  return (
    <>
      
      <main className="p-4">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">404</h1>
          <h2 className="text-2xl font-medium text-gray-700 mb-6">Page Not Found</h2>
          <p className="text-gray-600 mb-8 text-center">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </main>
    </>
  )
} 