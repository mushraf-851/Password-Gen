import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck, Award, Star,
  Eye, EyeOff, Lock, Key, Hash, Sparkles
} from 'lucide-react'

// ==================== TYPES ====================
type StrengthLevel = "weak" | "fair" | "strong" | "very-strong" | "unbreakable"

interface PasswordOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
  noDuplicate: boolean
  startsWithLetter: boolean
  endsWithNumber: boolean
}

// ==================== CONSTANTS ====================
const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  extended: "!@#$%^&*()_+-=[]{}|;:,.<>?~`₿§¶•ªº€£¥¢©®™±×÷",
  ambiguous: "il1I0O!|[]{}()",
}

const PRESET_LENGTHS = [8, 12, 16, 20, 24, 32, 48, 64]

// ==================== UTILITY FUNCTIONS ====================
function generatePassword(length: number, options: PasswordOptions): string {
  let chars = ""
  if (options.uppercase) chars += CHARSETS.uppercase
  if (options.lowercase) chars += CHARSETS.lowercase
  if (options.numbers) chars += CHARSETS.numbers
  if (options.symbols) chars += CHARSETS.symbols
  
  if (options.excludeAmbiguous) {
    const ambiguous = CHARSETS.ambiguous
    chars = chars.split('').filter(c => !ambiguous.includes(c)).join('')
  }
  
  if (!chars) chars = CHARSETS.lowercase

  let password = ""
  const array = new Uint32Array(length * 2)
  
  if (options.noDuplicate && chars.length >= length) {
    // Ensure no duplicate characters
    const charsArray = chars.split('')
    for (let i = 0; i < length; i++) {
      if (charsArray.length === 0) break
      const randomIndex = Math.floor(Math.random() * charsArray.length)
      password += charsArray[randomIndex]
      charsArray.splice(randomIndex, 1)
    }
  } else {
    crypto.getRandomValues(array)
    password = Array.from(array, (v) => chars[v % chars.length]).join('').substring(0, length)
  }

  // Apply constraints
  if (options.startsWithLetter && password.length > 0) {
    const letters = CHARSETS.uppercase + CHARSETS.lowercase
    if (!letters.includes(password[0])) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)]
      password = randomLetter + password.slice(1)
    }
  }

  if (options.endsWithNumber && password.length > 0) {
    if (!CHARSETS.numbers.includes(password[password.length - 1])) {
      const randomNumber = CHARSETS.numbers[Math.floor(Math.random() * CHARSETS.numbers.length)]
      password = password.slice(0, -1) + randomNumber
    }
  }

  return password
}

function getStrength(length: number, options: PasswordOptions): { 
  level: StrengthLevel
  label: string
  percent: number
  entropy: number
  crackTime: string
  score: number
} {
  let pool = 0
  if (options.uppercase) pool += 26
  if (options.lowercase) pool += 26
  if (options.numbers) pool += 10
  if (options.symbols) pool += 32
  if (pool === 0) pool = 26

  const entropy = Math.log2(pool) * length
  
  // Calculate crack time (1 billion guesses per second)
  const combinations = Math.pow(pool, length)
  const seconds = combinations / 1e9
  
  let crackTime = ""
  if (seconds < 60) crackTime = "instant"
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`
  else if (seconds < 315360000) crackTime = `${Math.round(seconds / 31536000)} years`
  else if (seconds < 1e12) crackTime = "centuries"
  else crackTime = "eternity"

  // Calculate score for visual indicator
  let score = 0
  if (length >= 12) score += 25
  else if (length >= 8) score += 15
  else score += 5
  
  if (options.uppercase) score += 10
  if (options.lowercase) score += 10
  if (options.numbers) score += 15
  if (options.symbols) score += 20
  if (!options.excludeAmbiguous) score += 5
  if (options.noDuplicate) score += 10
  
  score = Math.min(100, score)

  if (entropy < 36) return { 
    level: "weak", label: "Weak", percent: 20, entropy, crackTime, score 
  }
  if (entropy < 60) return { 
    level: "fair", label: "Fair", percent: 40, entropy, crackTime, score 
  }
  if (entropy < 80) return { 
    level: "strong", label: "Strong", percent: 60, entropy, crackTime, score 
  }
  if (entropy < 120) return { 
    level: "very-strong", label: "Very Strong", percent: 80, entropy, crackTime, score 
  }
  return { 
    level: "unbreakable", label: "Unbreakable", percent: 100, entropy, crackTime, score 
  }
}

const strengthColors: Record<StrengthLevel, string> = {
  weak: "#ef4444",
  fair: "#f59e0b",
  strong: "#10b981",
  "very-strong": "#8b5cf6",
  "unbreakable": "#ec4899",
}

const StrengthIcons: Record<StrengthLevel, any> = {
  weak: ShieldAlert,
  fair: Shield,
  strong: ShieldCheck,
  "very-strong": Award,
  "unbreakable": Sparkles,
}

// ==================== MAIN COMPONENT ====================
export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
    noDuplicate: false,
    startsWithLetter: false,
    endsWithNumber: false,
  })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('passwordHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('passwordFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newPassword = generatePassword(length, options)
    setPassword(newPassword)
    setCopied(false)
    
    // Update history using functional state update to avoid stale deps
    setHistory(prev => {
      const newHistory = [newPassword, ...prev.slice(0, 9)]
      localStorage.setItem('passwordHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }, [length, options])

  // regenerate when length or options change
  useEffect(() => {
    generate()
  }, [length, options])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleOption = (key: keyof PasswordOptions) => {
    const newOptions = { ...options, [key]: !options[key] }
    // Ensure at least one character type is selected
    if (!newOptions.uppercase && !newOptions.lowercase && !newOptions.numbers && !newOptions.symbols) {
      return
    }
    setOptions(newOptions)
  }

  const toggleFavorite = () => {
    if (favorites.includes(password)) {
      const newFavorites = favorites.filter(f => f !== password)
      setFavorites(newFavorites)
      localStorage.setItem('passwordFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [password, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('passwordFavorites', JSON.stringify(newFavorites))
    }
  }

  const strength = getStrength(length, options)
  const StrengthIcon = StrengthIcons[strength.level]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Password Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Create unbreakable passwords with military-grade randomness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
            <span className="text-xs text-green-400">crypto.getRandomValues()</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Password Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="font-mono text-2xl bg-gray-900 p-6 rounded-lg border-2 border-gray-700 break-all min-h-[100px] flex items-center">
              {password}
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                title="Advanced options"
              >
                <Hash size={16} className="text-gray-400" />
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
              className="p-4 bg-green-500 text-black rounded-lg hover:bg-green-400 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </button>
            <button 
              onClick={toggleFavorite}
              className={`p-4 rounded-lg transition ${
                favorites.includes(password) 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={favorites.includes(password) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={24} fill={favorites.includes(password) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StrengthIcon size={20} style={{ color: strengthColors[strength.level] }} />
            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 relative"
                style={{ 
                  width: `${strength.percent}%`,
                  backgroundColor: strengthColors[strength.level],
                  boxShadow: `0 0 10px ${strengthColors[strength.level]}`
                }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: strengthColors[strength.level] }}>
              {strength.label}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-gray-400">Entropy</div>
              <div className="text-xl font-bold text-green-400">{strength.entropy.toFixed(1)} bits</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-gray-400">Crack Time</div>
              <div className="text-xl font-bold text-purple-400">{strength.crackTime}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-gray-400">Security Score</div>
              <div className="text-xl font-bold text-pink-400">{strength.score}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Length Control */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
          <label htmlFor="password-length" className="text-sm font-medium text-gray-300">Password Length</label>
          <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-400">{length}</span>
              <span className="text-sm text-gray-500">characters</span>
            </div>
          </div>
          <input 
            id="password-length"
            name="password-length"
            type="range" 
            min={4} 
            max={64} 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between mt-2">
            {PRESET_LENGTHS.map(l => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={`px-2 py-1 text-xs rounded ${
                  length === l 
                    ? 'bg-green-500 text-black font-bold' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Character Types */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Character Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'uppercase', label: 'Uppercase', color: 'green' },
              { key: 'lowercase', label: 'Lowercase', color: 'blue' },
              { key: 'numbers', label: 'Numbers', color: 'purple' },
              { key: 'symbols', label: 'Symbols', color: 'pink' },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleOption(key as keyof PasswordOptions)}
                className={`relative px-4 py-3 rounded-lg font-medium transition-all ${
                  options[key as keyof PasswordOptions]
                    ? `bg-${color}-500/20 border-2 border-${color}-500 text-${color}-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]`
                    : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {label}
                {options[key as keyof PasswordOptions] && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700 animate-fadeIn">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Advanced Constraints
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.excludeAmbiguous}
                  onChange={() => toggleOption('excludeAmbiguous')}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  Exclude ambiguous
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.noDuplicate}
                  onChange={() => toggleOption('noDuplicate')}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  No duplicates
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.startsWithLetter}
                  onChange={() => toggleOption('startsWithLetter')}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  Start with letter
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.endsWithNumber}
                  onChange={() => toggleOption('endsWithNumber')}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  End with number
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* History & Favorites */}
      {(history.length > 0 || favorites.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <RefreshCw size={14} />
                Recently Generated
              </h3>
              <div className="space-y-2">
                {history.map((pwd, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                    <span className="font-mono text-sm">{pwd}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(pwd)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-600 rounded"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {favorites.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                Favorite Passwords
              </h3>
              <div className="space-y-2">
                {favorites.map((pwd, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                    <span className="font-mono text-sm">{pwd}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(pwd)}
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
    </div>
  )
}