import { Link } from 'react-router-dom'
import { 
  Key, User, Fingerprint, CreditCard, Wifi, Smartphone,
  Music, Code, Database, MapPin, Globe2, ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const tools = [
    { 
      id: 'password', 
      name: 'Password Generator', 
      icon: Key, 
      color: 'green',
      description: 'Create strong, secure passwords with customizable options',
      path: '/password-generator'
    },
    { 
      id: 'username', 
      name: 'Username Generator', 
      icon: User, 
      color: 'blue',
      description: 'Generate unique usernames for gaming, social media, and more',
      path: '/username-generator'
    },
    { 
      id: 'pin', 
      name: 'PIN Generator', 
      icon: Fingerprint, 
      color: 'purple',
      description: 'Numeric, hex, and alphanumeric PINs for secure access',
      path: '/pin-generator'
    },
    { 
      id: 'creditcard', 
      name: 'Credit Card Generator', 
      icon: CreditCard, 
      color: 'pink',
      description: 'Test credit card numbers for development and testing',
      path: '/credit-card-generator'
    },
    { 
      id: 'wifi', 
      name: 'Wi-Fi Password Generator', 
      icon: Wifi, 
      color: 'yellow',
      description: 'Secure network keys for WEP, WPA, WPA2, WPA3',
      path: '/wifi-password-generator'
    },
    { 
      id: 'otp', 
      name: 'OTP Generator', 
      icon: Smartphone, 
      color: 'indigo',
      description: '2FA secrets for authenticator apps',
      path: '/otp-generator'
    },
    { 
      id: 'memorable', 
      name: 'Memorable Password', 
      icon: Music, 
      color: 'red',
      description: 'Easy-to-remember word-based passwords',
      path: '/memorable-password-generator'
    },
    { 
      id: 'apikey', 
      name: 'API Key Generator', 
      icon: Code, 
      color: 'cyan',
      description: 'Secure keys for development and authentication',
      path: '/api-key-generator'
    },
    { 
      id: 'uuid', 
      name: 'UUID Generator', 
      icon: Database, 
      color: 'emerald',
      description: 'Version 4 unique identifiers',
      path: '/uuid-generator'
    },
    { 
      id: 'license', 
      name: 'License Plate Generator', 
      icon: MapPin, 
      color: 'amber',
      description: 'Random plates for US, UK, EU, JP formats',
      path: '/license-plate-generator'
    },
    { 
      id: 'identity', 
      name: 'Fake Identity Generator', 
      icon: Globe2, 
      color: 'violet',
      description: 'Test names, emails, phone numbers, addresses',
      path: '/fake-identity-generator'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              🚀 100% Free
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm">
              🔒 Client-Side Only
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm">
              ⚡ 11 Powerful Tools
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ultimate Identity
            </span>
            <br />
            <span className="text-white">Generator Suite</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your all-in-one solution for generating secure passwords, unique usernames, 
            test credit cards, and everything else you need for digital identity management.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 
                         hover:border-green-500/50 transition-all duration-300 
                         hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
              >
                <div className={`w-12 h-12 rounded-lg bg-${tool.color}-500/20 
                              flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${tool.color}-400`} size={24} />
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4">
                  {tool.description}
                </p>
                
                <div className="flex items-center text-sm text-green-400 group-hover:text-green-300">
                  <span>Try it now</span>
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-gray-800/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">11</div>
            <div className="text-gray-400">Powerful Tools</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-gray-400">Client-Side</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-pink-400 mb-2">∞</div>
            <div className="text-gray-400">Combinations</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">0</div>
            <div className="text-gray-400">Tracking</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-green-500/10 via-purple-500/10 to-pink-500/10 
                      rounded-2xl p-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">
            Ready to generate your next identity?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            All tools are completely free, work offline, and never send your data to any server.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/password-generator"
              className="px-8 py-3 bg-green-500 text-black font-bold rounded-lg 
                       hover:bg-green-400 transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#tools"
              className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg 
                       hover:bg-gray-600 transition-colors"
            >
              View All Tools
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>© 2026 Ultimate Identity Suite. All tools run 100% in your browser.</p>
          <p className="mt-2">
            Powered by{' '}
            <span className="text-green-400 font-mono">crypto.getRandomValues()</span>
          </p>
        </footer>
      </div>
    </div>
  )
}