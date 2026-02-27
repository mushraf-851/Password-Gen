import { useState } from 'react'
import PasswordGenerator from './generators/PasswordGenerator'
import UsernameGenerator from './generators/UsernameGenerator'
import PINGenerator from './generators/PINGenerator'
import CreditCardGenerator from './generators/CreditCardGenerator'
import WiFiGenerator from './generators/WiFiGenerator'
import OTPGenerator from './generators/OTPGenerator'
import MemorableGenerator from './generators/MemorableGenerator'
import APIKeyGenerator from './generators/APIKeyGenerator'
import UUIDGenerator from './generators/UUIDGenerator'
import LicenseGenerator from './generators/LicenseGenerator'
import IdentityGenerator from './generators/IdentityGenerator'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('password')

  const tabs = [
    { id: 'password', name: 'Password', icon: '🔐', color: 'green', component: PasswordGenerator },
    { id: 'username', name: 'Username', icon: '👤', color: 'blue', component: UsernameGenerator },
    { id: 'pin', name: 'PIN', icon: '🔢', color: 'purple', component: PINGenerator },
    { id: 'creditcard', name: 'Credit Card', icon: '💳', color: 'pink', component: CreditCardGenerator },
    { id: 'wifi', name: 'WiFi', icon: '📶', color: 'yellow', component: WiFiGenerator },
    { id: 'otp', name: 'OTP', icon: '🔑', color: 'indigo', component: OTPGenerator },
    { id: 'memorable', name: 'Memorable', icon: '🧠', color: 'red', component: MemorableGenerator },
    { id: 'apikey', name: 'API Key', icon: '🔌', color: 'cyan', component: APIKeyGenerator },
    { id: 'uuid', name: 'UUID', icon: '🆔', color: 'emerald', component: UUIDGenerator },
    { id: 'license', name: 'License', icon: '🚗', color: 'amber', component: LicenseGenerator },
    { id: 'identity', name: 'Identity', icon: '🧑', color: 'violet', component: IdentityGenerator },
  ]

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PasswordGenerator

  // Simple inline styles instead of complex className functions
  const getTabStyle = (color: string, isActive: boolean) => {
    const baseStyle = "p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1 "
    if (isActive) {
      return baseStyle + `bg-${color}-500/20 border-${color}-500 text-${color}-400 scale-105 shadow-lg`
    }
    return baseStyle + "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:scale-102"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ultimate Identity
            </span>
            <span className="text-white"> Suite</span>
          </h1>
          <p className="text-gray-400 text-lg">
            11 powerful tools for all your identity generation needs
          </p>
        </div>

        {/* Tab Navigation - Simple Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const colorClasses: Record<string, string> = {
              green: isActive ? 'bg-green-500/20 border-green-500 text-green-400' : '',
              blue: isActive ? 'bg-blue-500/20 border-blue-500 text-blue-400' : '',
              purple: isActive ? 'bg-purple-500/20 border-purple-500 text-purple-400' : '',
              pink: isActive ? 'bg-pink-500/20 border-pink-500 text-pink-400' : '',
              yellow: isActive ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : '',
              indigo: isActive ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : '',
              red: isActive ? 'bg-red-500/20 border-red-500 text-red-400' : '',
              cyan: isActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : '',
              emerald: isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : '',
              amber: isActive ? 'bg-amber-500/20 border-amber-500 text-amber-400' : '',
              violet: isActive ? 'bg-violet-500/20 border-violet-500 text-violet-400' : '',
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  p-3 rounded-lg border transition-all duration-200
                  flex flex-col items-center gap-1
                  ${isActive ? colorClasses[tab.color] + ' scale-105 shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}
                `}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Active Generator */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
          <ActiveComponent />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All tools run 100% client-side • No data leaves your browser • Powered by crypto.getRandomValues()</p>
        </div>
      </div>
    </div>
  )
}