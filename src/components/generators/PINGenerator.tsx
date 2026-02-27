import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, Shield, 
  Fingerprint, Hash, Lock, Key, Sparkles, Eye, EyeOff,
  AlertCircle, CheckCircle, Clock, Database
} from 'lucide-react'

// ==================== TYPES ====================
type PINType = 'numeric' | 'hexadecimal' | 'alphanumeric' | 'binary' | 'custom'
type PINSecurityLevel = 'weak' | 'fair' | 'strong' | 'very-strong'

interface PINOptions {
  type: PINType
  length: number
  excludeSequential: boolean
  excludeRepeating: boolean
  excludeYears: boolean
  excludeCommon: boolean
  customCharset: string
}

// ==================== CONSTANTS ====================
const PIN_PATTERNS = {
  numeric: '0123456789',
  hexadecimal: '0123456789ABCDEF',
  alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  binary: '01',
  custom: ''
}

const COMMON_PINS = [
  '1234', '0000', '1111', '1212', '7777', '1004', '2000', '4444',
  '2222', '5555', '6666', '8888', '9999', '123456', '654321', '111111',
  '123123', '12345678', '112233', '121212', '123321', '123123', '12345'
]

const SECURITY_LEVELS: Record<PINSecurityLevel, { color: string; label: string; icon: any }> = {
  weak: { color: '#ef4444', label: 'Weak', icon: AlertCircle },
  fair: { color: '#f59e0b', label: 'Fair', icon: Shield },
  strong: { color: '#10b981', label: 'Strong', icon: Lock },
  'very-strong': { color: '#8b5cf6', label: 'Very Strong', icon: Key }
}

// ==================== UTILITY FUNCTIONS ====================
function generatePIN(options: PINOptions): string {
  let chars = PIN_PATTERNS[options.type]
  
  if (options.type === 'custom' && options.customCharset) {
    chars = options.customCharset
  }
  
  if (!chars) chars = PIN_PATTERNS.numeric
  
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const array = new Uint32Array(options.length)
    crypto.getRandomValues(array)
    let pin = Array.from(array, (v) => chars[v % chars.length]).join('')
    
    // Apply security filters
    let isValid = true
    
    if (options.excludeSequential) {
      if (isSequential(pin)) isValid = false
    }
    
    if (options.excludeRepeating) {
      if (hasRepeating(pin)) isValid = false
    }
    
    if (options.excludeYears) {
      if (isYear(pin)) isValid = false
    }
    
    if (options.excludeCommon) {
      if (COMMON_PINS.includes(pin)) isValid = false
    }
    
    if (isValid) return pin
    attempts++
  }
  
  // Fallback if no valid PIN found after max attempts
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  return Array.from(array, (v) => chars[v % chars.length]).join('')
}

function isSequential(pin: string): boolean {
  // Check for sequential numbers (123, 234, 345, etc.)
  for (let i = 0; i < pin.length - 2; i++) {
    const a = parseInt(pin[i])
    const b = parseInt(pin[i + 1])
    const c = parseInt(pin[i + 2])
    
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
      if (b === a + 1 && c === b + 1) return true
      if (b === a - 1 && c === b - 1) return true
    }
  }
  return false
}

function hasRepeating(pin: string): boolean {
  // Check for repeating patterns (111, 222, etc.)
  for (let i = 0; i < pin.length - 2; i++) {
    if (pin[i] === pin[i + 1] && pin[i] === pin[i + 2]) return true
  }
  return false
}

function isYear(pin: string): boolean {
  // Check if PIN looks like a year (1900-2099)
  if (pin.length === 4 && /^\d{4}$/.test(pin)) {
    const year = parseInt(pin)
    if (year >= 1900 && year <= 2099) return true
  }
  return false
}

function getPINSecurity(pin: string, type: PINType): {
  level: PINSecurityLevel
  entropy: number
  crackTime: string
  issues: string[]
} {
  const issues: string[] = []
  let entropy = 0
  let pool = 0
  
  // Calculate pool size based on type
  switch(type) {
    case 'numeric':
      pool = 10
      break
    case 'hexadecimal':
      pool = 16
      break
    case 'alphanumeric':
      pool = 62
      break
    case 'binary':
      pool = 2
      break
    default:
      pool = 10
  }
  
  entropy = Math.log2(pool) * pin.length
  
  // Check for common issues
  if (COMMON_PINS.includes(pin)) {
    issues.push('This is a commonly used PIN')
    entropy -= 10
  }
  
  if (isSequential(pin)) {
    issues.push('Contains sequential numbers')
    entropy -= 5
  }
  
  if (hasRepeating(pin)) {
    issues.push('Contains repeating digits')
    entropy -= 5
  }
  
  if (isYear(pin)) {
    issues.push('Looks like a year')
    entropy -= 8
  }
  
  if (/^(\d)\1+$/.test(pin)) {
    issues.push('All digits are the same')
    entropy -= 15
  }
  
  entropy = Math.max(0, entropy)
  
  // Calculate crack time
  const combinations = Math.pow(pool, pin.length)
  const seconds = combinations / 1e9 // 1 billion guesses per second
  
  let crackTime = ''
  if (seconds < 60) crackTime = 'instant'
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`
  else crackTime = 'years'
  
  // Determine security level
  let level: PINSecurityLevel = 'weak'
  if (entropy >= 30) level = 'fair'
  if (entropy >= 40) level = 'strong'
  if (entropy >= 50) level = 'very-strong'
  
  return { level, entropy, crackTime, issues }
}

function formatPIN(pin: string, format: 'none' | 'spaces' | 'dashes' | 'groups'): string {
  switch(format) {
    case 'spaces':
      return pin.match(/.{1,4}/g)?.join(' ') || pin
    case 'dashes':
      return pin.match(/.{1,4}/g)?.join('-') || pin
    case 'groups':
      if (pin.length === 16) {
        return pin.replace(/(\d{4})/g, '$1 ').trim()
      }
      return pin
    default:
      return pin
  }
}

// ==================== MAIN COMPONENT ====================
export default function PINGenerator() {
  const [options, setOptions] = useState<PINOptions>({
    type: 'numeric',
    length: 6,
    excludeSequential: true,
    excludeRepeating: true,
    excludeYears: true,
    excludeCommon: true,
    customCharset: ''
  })
  const [pin, setPin] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [displayFormat, setDisplayFormat] = useState<'none' | 'spaces' | 'dashes' | 'groups'>('none')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pinHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('pinFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newPIN = generatePIN(options)
    setPin(newPIN)
    setCopied(false)
    
    setHistory(prev => {
      const newHistory = [newPIN, ...prev.slice(0, 9)]
      localStorage.setItem('pinHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }, [options])

  useEffect(() => {
    generate()
  }, [options])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    if (favorites.includes(pin)) {
      const newFavorites = favorites.filter(f => f !== pin)
      setFavorites(newFavorites)
      localStorage.setItem('pinFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [pin, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('pinFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof PINOptions>(key: K, value: PINOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const security = getPINSecurity(pin, options.type)
  const SecurityIcon = SECURITY_LEVELS[security.level].icon
  const formattedPIN = formatPIN(pin, displayFormat)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            PIN Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Create secure PINs for access codes, authentication, and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/30">
            <span className="text-xs text-purple-400">{options.type} · {options.length} digits</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* PIN Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="font-mono text-4xl bg-gray-900 p-6 rounded-lg border-2 border-gray-700 break-all min-h-[100px] flex items-center justify-center tracking-widest">
              {formattedPIN}
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => setDisplayFormat(prev => 
                  prev === 'none' ? 'spaces' : 
                  prev === 'spaces' ? 'dashes' : 
                  prev === 'dashes' ? 'groups' : 'none'
                )}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                title="Change display format"
              >
                <Eye size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={generate}
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
              title="Generate new"
            >
              <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button 
              onClick={copyToClipboard}
              className="p-4 bg-purple-500 text-black rounded-lg hover:bg-purple-400 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </button>
            <button 
              onClick={toggleFavorite}
              className={`p-4 rounded-lg transition ${
                favorites.includes(pin) 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={favorites.includes(pin) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={24} fill={favorites.includes(pin) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Security Meter */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <SecurityIcon size={20} style={{ color: SECURITY_LEVELS[security.level].color }} />
            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(security.entropy / 60) * 100}%`,
                  backgroundColor: SECURITY_LEVELS[security.level].color,
                  boxShadow: `0 0 10px ${SECURITY_LEVELS[security.level].color}`
                }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: SECURITY_LEVELS[security.level].color }}>
              {SECURITY_LEVELS[security.level].label}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-gray-400">Entropy</div>
              <div className="text-xl font-bold text-purple-400">{security.entropy.toFixed(1)} bits</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-gray-400">Crack Time</div>
              <div className="text-xl font-bold text-indigo-400">{security.crackTime}</div>
            </div>
          </div>

          {/* Security Issues */}
          {security.issues.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
                <AlertCircle size={12} />
                Security Issues Found
              </div>
              <div className="space-y-1">
                {security.issues.map((issue, i) => (
                  <div key={i} className="text-xs text-red-300 flex items-center gap-1">
                    <span>•</span> {issue}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* PIN Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">PIN Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { type: 'numeric', label: 'Numeric', icon: Fingerprint },
              { type: 'hexadecimal', label: 'Hex', icon: Hash },
              { type: 'alphanumeric', label: 'Alphanumeric', icon: Key },
              { type: 'binary', label: 'Binary', icon: Database },
              { type: 'custom', label: 'Custom', icon: Sparkles },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => updateOption('type', type as PINType)}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                  options.type === type
                    ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                    : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Charset (only shown for custom type) */}
        {options.type === 'custom' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Character Set
            </label>
            <input
              type="text"
              value={options.customCharset}
              onChange={(e) => updateOption('customCharset', e.target.value)}
              placeholder="e.g., 0123456789ABCDEF"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter characters to use in your PIN
            </p>
          </div>
        )}

        {/* Length Control */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">PIN Length</label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-400">{options.length}</span>
              <span className="text-sm text-gray-500">digits</span>
            </div>
          </div>
          <input 
            type="range" 
            min={4} 
            max={16} 
            value={options.length} 
            onChange={(e) => updateOption('length', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between mt-2">
            {[4, 6, 8, 10, 12, 16].map(l => (
              <button
                key={l}
                onClick={() => updateOption('length', l)}
                className={`px-2 py-1 text-xs rounded ${
                  options.length === l 
                    ? 'bg-purple-500 text-black font-bold' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Security Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-green-400" />
            Security Filters
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.excludeSequential}
                onChange={(e) => updateOption('excludeSequential', e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">No sequential (123)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.excludeRepeating}
                onChange={(e) => updateOption('excludeRepeating', e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">No repeating (111)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.excludeYears}
                onChange={(e) => updateOption('excludeYears', e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">No years (1990-2099)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.excludeCommon}
                onChange={(e) => updateOption('excludeCommon', e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">No common PINs</span>
            </label>
          </div>
        </div>
      </div>

      {/* History & Favorites */}
      {(history.length > 0 || favorites.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <History size={14} />
                Recently Generated
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((p, index) => {
                  const sec = getPINSecurity(p, options.type)
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{p}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                          backgroundColor: `${SECURITY_LEVELS[sec.level].color}20`,
                          color: SECURITY_LEVELS[sec.level].color 
                        }}>
                          {sec.level}
                        </span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(p)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-600 rounded"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {favorites.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                Favorite PINs
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {favorites.map((p, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                    <span className="font-mono text-sm">{p}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(p)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-600 rounded"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Clock size={14} />
          PIN Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Total Combinations</div>
            <div className="text-lg font-bold text-white">
              {new Intl.NumberFormat().format(Math.pow(
                options.type === 'numeric' ? 10 : 
                options.type === 'hexadecimal' ? 16 :
                options.type === 'alphanumeric' ? 62 :
                options.type === 'binary' ? 2 : 10,
                options.length
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">PINs Generated</div>
            <div className="text-lg font-bold text-white">{history.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Favorite PINs</div>
            <div className="text-lg font-bold text-white">{favorites.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Current Strength</div>
            <div className="text-lg font-bold" style={{ color: SECURITY_LEVELS[security.level].color }}>
              {security.level}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
