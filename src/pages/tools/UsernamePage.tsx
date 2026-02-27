import UsernameGenerator from '../../components/generators/UsernameGenerator'

export default function UsernamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition inline-flex items-center gap-2"
          >
            ← Back to Home
          </a>
        </div>
        <UsernameGenerator />
      </div>
    </div>
  )
}
