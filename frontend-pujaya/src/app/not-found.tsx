import Link from 'next/link'

export default function notFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-blue-600">
      <h2 className="text-8xl font-extrabold text-white mb-4">404</h2>
      <p className="text-2xl text-white mb-8">Oops! Page not found</p>

      <Link
        href="/"
        className="px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
      >
        Return to Home
      </Link>
    </div>
  )
}


