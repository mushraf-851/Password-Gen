import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History,
  Shield, Lock, Key, Clock, Hash, QrCode, Globe,
  AlertCircle, Award, Fingerprint,
  Eye, EyeOff
} from 'lucide-react'

// ==================== TYPES ====================
type OTPType = 'totp' | 'hotp' | 'steam' | 'yandex' | 'google' | 'microsoft'
type OTPAlgorithm = 'SHA1' | 'SHA256' | 'SHA512'
type OTPEncoding = 'base32' | 'base64' | 'hex' | 'plain'

interface OTPSecret {
  secret: string
  formatted: string
  type: OTPType
  algorithm: OTPAlgorithm
  digits: number
  period: number
  counter: number
  encoding: OTPEncoding
  issuer: string
  account: string
  uri: string
  qrData: string
  strength: SecurityLevel
  entropy: number
}

interface OTPOptions {
  type: OTPType
  algorithm: OTPAlgorithm
  digits: number
  period: number
  encoding: OTPEncoding
  length: number
  issuer: string
  account: string
  counter: number
  includeLowercase: boolean
  includeUppercase: boolean
  includeNumbers: boolean
}

type SecurityLevel = 'weak' | 'fair' | 'good' | 'strong' | 'excellent'

// ==================== CONSTANTS ====================
const OTP_TYPES: Record<OTPType, {
  name: string
  defaultDigits: number
  defaultPeriod: number
  description: string
  icon: any
}> = {
  totp: {
    name: 'TOTP',
    defaultDigits: 6,
    defaultPeriod: 30,
    description: 'Time-based One-Time Password',
    icon: Clock
  },
  hotp: {
    name: 'HOTP',
    defaultDigits: 6,
    defaultPeriod: 0,
    description: 'HMAC-based One-Time Password',
    icon: Hash
  },
  steam: {
    name: 'Steam',
    defaultDigits: 5,
    defaultPeriod: 30,
    description: 'Steam Guard',
    icon: Award
  },
  yandex: {
    name: 'Yandex',
    defaultDigits: 8,
    defaultPeriod: 30,
    description: 'Yandex.Key',
    icon: Globe
  },
  google: {
    name: 'Google',
    defaultDigits: 6,
    defaultPeriod: 30,
    description: 'Google Authenticator',
    icon: Fingerprint
  },
  microsoft: {
    name: 'Microsoft',
    defaultDigits: 8,
    defaultPeriod: 30,
    description: 'Microsoft Authenticator',
    icon: Shield
  }
}

const ALGORITHMS: OTPAlgorithm[] = ['SHA1', 'SHA256', 'SHA512']

const ENCODINGS: Record<OTPEncoding, {
  name: string
  chars: string
  description: string
}> = {
  base32: {
    name: 'Base32',
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    description: 'Standard for TOTP (Google Authenticator)'
  },
  base64: {
    name: 'Base64',
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    description: 'Common for API keys'
  },
  hex: {
    name: 'Hexadecimal',
    chars: '0123456789ABCDEF',
    description: 'Hex encoded'
  },
  plain: {
    name: 'Plain',
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    description: 'Raw alphanumeric'
  }
}

const SECURITY_LEVELS: Record<SecurityLevel, { color: string; icon: any }> = {
  weak: { color: '#ef4444', icon: AlertCircle },
  fair: { color: '#f59e0b', icon: Lock },
  good: { color: '#3b82f6', icon: Shield },
  strong: { color: '#10b981', icon: Key },
  excellent: { color: '#8b5cf6', icon: Award }
}


// ==================== UTILITY FUNCTIONS ====================
function generateOTPSecret(options: OTPOptions): OTPSecret {
  const encoding = ENCODINGS[options.encoding]
  const chars = encoding.chars
  
  // Generate random secret
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  let secret = Array.from(array, (v) => chars[v % chars.length]).join('')
  
  // Format secret in groups of 4
  const formatted = secret.match(/.{1,4}/g)?.join(' ') || secret
  
  // Calculate entropy
  const entropy = Math.log2(chars.length) * options.length
  
  // Determine strength
  let strength: SecurityLevel = 'weak'
  if (entropy >= 128) strength = 'excellent'
  else if (entropy >= 80) strength = 'strong'
  else if (entropy >= 60) strength = 'good'
  else if (entropy >= 40) strength = 'fair'
  
  // Generate URI for QR code
  const issuer = options.issuer || 'MyApp'
  const account = options.account || 'user@example.com'
  
  let uri = ''
  if (options.type === 'totp') {
    uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${options.algorithm}&digits=${options.digits}&period=${options.period}`
  } else if (options.type === 'hotp') {
    uri = `otpauth://hotp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${options.algorithm}&digits=${options.digits}&counter=${options.counter}`
  } else if (options.type === 'steam') {
    uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${options.algorithm}&digits=${options.digits}&period=${options.period}&steam=true`
  } else {
    uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${options.algorithm}&digits=${options.digits}&period=${options.period}`
  }
  
  // Generate QR code data (simplified - actual QR would need library)
  const qrData = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`
  
  return {
    secret,
    formatted,
    type: options.type,
    algorithm: options.algorithm,
    digits: options.digits,
    period: options.period,
    counter: options.counter,
    encoding: options.encoding,
    issuer,
    account,
    uri,
    qrData,
    strength,
    entropy
  }
}

function generateTestOTP(secret: string, algorithm: OTPAlgorithm, digits: number, time: number = Date.now()): string {
  // This is a simplified simulation - actual OTP would require crypto HMAC
  // For demo purposes, we generate a pseudo-random but deterministic code
  const hash = (secret + time + algorithm).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const code = Math.abs(hash) % Math.pow(10, digits)
  return code.toString().padStart(digits, '0')
}


function getRemainingTime(period: number): number {
  return period - (Math.floor(Date.now() / 1000) % period)
}

// ==================== MAIN COMPONENT ====================
export default function OTPGenerator() {
  const [options, setOptions] = useState<OTPOptions>({
    type: 'totp',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    encoding: 'base32',
    length: 32,
    issuer: '',
    account: '',
    counter: 1,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true
  })
  const [secret, setSecret] = useState<OTPSecret | null>(null)
  const [currentOTP, setCurrentOTP] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<OTPSecret[]>([])
  const [favorites, setFavorites] = useState<OTPSecret[]>([])
  const [showSecret, setShowSecret] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(30)
  const [counter, setCounter] = useState<number>(1)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('otpHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('otpFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newSecret = generateOTPSecret(options)
    setSecret(newSecret)
    
    // Generate test OTP
    const otp = generateTestOTP(newSecret.secret, options.algorithm, options.digits)
    setCurrentOTP(otp)
    
    setCopied(false)
    
    setHistory(prev => {
      const newHistory = [newSecret, ...prev.slice(0, 9)]
      localStorage.setItem('otpHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }, [options])

  useEffect(() => {
    generate()
  }, [options])

  // Timer for TOTP
  useEffect(() => {
    if (options.type === 'totp' || options.type === 'steam' || options.type === 'google') {
      const timer = setInterval(() => {
        const remaining = getRemainingTime(options.period)
        setTimeRemaining(remaining)
        
        // Update OTP when period changes
        if (remaining === options.period - 1) {
          if (secret) {
            const otp = generateTestOTP(secret.secret, options.algorithm, options.digits)
            setCurrentOTP(otp)
          }
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [options.type, options.period, secret, options.algorithm, options.digits])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAllToClipboard = async () => {
    if (!secret) return
    const text = `Secret: ${secret.secret}\nType: ${secret.type}\nAlgorithm: ${secret.algorithm}\nDigits: ${secret.digits}\nIssuer: ${secret.issuer}\nAccount: ${secret.account}\nURI: ${secret.uri}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    if (!secret) return
    
    if (favorites.some(f => f.secret === secret.secret)) {
      const newFavorites = favorites.filter(f => f.secret !== secret.secret)
      setFavorites(newFavorites)
      localStorage.setItem('otpFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [secret, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('otpFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof OTPOptions>(key: K, value: OTPOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const incrementCounter = () => {
    setCounter(prev => prev + 1)
    updateOption('counter', counter + 1)
    if (secret) {
      const otp = generateTestOTP(secret.secret, options.algorithm, options.digits)
      setCurrentOTP(otp)
    }
  }

  const SecurityIcon = secret ? SECURITY_LEVELS[secret.strength].icon : Shield

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            OTP Secret Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate secure secrets for two-factor authentication
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/30">
            <span className="text-xs text-indigo-400">{OTP_TYPES[options.type].name} · {options.algorithm}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {secret && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          {/* Current OTP Display */}
          <div className="mb-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Current OTP</div>
            <div className="font-mono text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {currentOTP}
            </div>
            
            {/* Timer for TOTP */}
            {(options.type === 'totp' || options.type === 'steam' || options.type === 'google') && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeRemaining / options.period) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{timeRemaining}s remaining</span>
              </div>
            )}
            
            {/* Counter for HOTP */}
            {options.type === 'hotp' && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={incrementCounter}
                  className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Increment Counter ({counter})
                </button>
              </div>
            )}
          </div>

          {/* Secret Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret.formatted}
                  readOnly
                  className="w-full font-mono bg-gray-900 p-4 pr-12 rounded-lg border-2 border-gray-700 text-lg"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(secret.secret)}
                className="p-4 bg-indigo-500 text-black rounded-lg hover:bg-indigo-400 transition"
                title="Copy secret"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Security Meter */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <SecurityIcon size={20} style={{ color: SECURITY_LEVELS[secret.strength].color }} />
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(secret.entropy / 128) * 100}%`,
                    backgroundColor: SECURITY_LEVELS[secret.strength].color
                  }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: SECURITY_LEVELS[secret.strength].color }}>
                {secret.strength} ({Math.round(secret.entropy)} bits)
              </span>
            </div>
          </div>

          {/* Secret Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Type</div>
              <div className="text-sm font-bold">{OTP_TYPES[secret.type].name}</div>
              <div className="text-xs text-gray-500 mt-1">{OTP_TYPES[secret.type].description}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Algorithm</div>
              <div className="text-sm font-bold">{secret.algorithm}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Digits</div>
              <div className="text-sm font-bold">{secret.digits}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Encoding</div>
              <div className="text-sm font-bold">{secret.encoding}</div>
              <div className="text-xs text-gray-500 mt-1">{ENCODINGS[secret.encoding].description}</div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Issuer</div>
              <div className="text-sm font-bold">{secret.issuer || 'Not set'}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Account</div>
              <div className="text-sm font-bold">{secret.account || 'Not set'}</div>
            </div>
          </div>

          {/* URI and QR Code */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">OTP URI</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={secret.uri}
                  readOnly
                  className="flex-1 font-mono text-xs bg-gray-900 p-3 rounded-lg border border-gray-700"
                />
                <button
                  onClick={() => copyToClipboard(secret.uri)}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  title="Copy URI"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {showQR && (
              <div className="p-4 bg-white rounded-lg flex flex-col items-center">
                <div className="text-black mb-2 font-mono text-xs break-all">
                  {secret.qrData}
                </div>
                <button
                  onClick={() => copyToClipboard(secret.qrData)}
                  className="mt-2 px-4 py-2 bg-indigo-500 text-black rounded-lg hover:bg-indigo-400 transition text-sm"
                >
                  Copy QR Data
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm"
              >
                <QrCode size={16} />
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
              <button
                onClick={copyAllToClipboard}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm"
              >
                <Copy size={16} />
                Copy All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <button 
          onClick={generate}
          className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
          title="Generate new"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
        <button 
          onClick={toggleFavorite}
          className={`p-3 rounded-lg transition ${
            favorites.some(f => f?.secret === secret?.secret)
              ? 'bg-yellow-500 text-black' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title="Add to favorites"
        >
          <Star size={20} fill={favorites.some(f => f?.secret === secret?.secret) ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* OTP Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">OTP Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(Object.keys(OTP_TYPES) as OTPType[]).map((type) => {
              const Icon = OTP_TYPES[type].icon
              return (
                <button
                  key={type}
                  onClick={() => {
                    updateOption('type', type)
                    updateOption('digits', OTP_TYPES[type].defaultDigits)
                    updateOption('period', OTP_TYPES[type].defaultPeriod)
                  }}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                    options.type === type
                      ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{OTP_TYPES[type].name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Algorithm & Digits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Algorithm</h3>
            <div className="grid grid-cols-3 gap-2">
              {ALGORITHMS.map(alg => (
                <button
                  key={alg}
                  onClick={() => updateOption('algorithm', alg)}
                  className={`p-2 rounded-lg text-sm ${
                    options.algorithm === alg
                      ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Digits</h3>
            <div className="grid grid-cols-4 gap-2">
              {[6, 7, 8].map(d => (
                <button
                  key={d}
                  onClick={() => updateOption('digits', d)}
                  className={`p-2 rounded-lg text-sm ${
                    options.digits === d
                      ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Encoding & Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Encoding</h3>
            <select
              value={options.encoding}
              onChange={(e) => updateOption('encoding', e.target.value as OTPEncoding)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {(Object.keys(ENCODINGS) as OTPEncoding[]).map(enc => (
                <option key={enc} value={enc}>{ENCODINGS[enc].name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{ENCODINGS[options.encoding].description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Secret Length</h3>
            <input 
              type="range" 
              min={16} 
              max={64} 
              value={options.length} 
              onChange={(e) => updateOption('length', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between mt-2">
              {[16, 24, 32, 48, 64].map(l => (
                <button
                  key={l}
                  onClick={() => updateOption('length', l)}
                  className={`px-2 py-1 text-xs rounded ${
                    options.length === l 
                      ? 'bg-indigo-500 text-black font-bold' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Period & Counter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Period (seconds)</h3>
            <select
              value={options.period}
              onChange={(e) => updateOption('period', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              disabled={options.type === 'hotp'}
            >
              {[30, 60, 90, 120].map(p => (
                <option key={p} value={p}>{p} seconds</option>
              ))}
            </select>
          </div>

          {options.type === 'hotp' && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Initial Counter</h3>
              <input
                type="number"
                min={0}
                value={options.counter}
                onChange={(e) => updateOption('counter', parseInt(e.target.value))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Account Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Issuer</label>
              <input
                type="text"
                value={options.issuer}
                onChange={(e) => updateOption('issuer', e.target.value)}
                placeholder="e.g., Google, GitHub"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Account</label>
              <input
                type="text"
                value={options.account}
                onChange={(e) => updateOption('account', e.target.value)}
                placeholder="e.g., user@example.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History & Favorites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <History size={14} />
              Recently Generated
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-sm">{item.issuer || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 font-mono">{item.formatted}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.secret)}
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
              Favorite Secrets
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-sm">{item.issuer || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 font-mono">{item.formatted}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.secret)}
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

      {/* Security Info */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-indigo-400 mb-2 flex items-center gap-2">
          <Shield size={14} />
          About OTP Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div>
            <span className="font-bold text-indigo-400">TOTP</span> - Time-based OTP (Google Authenticator)
          </div>
          <div>
            <span className="font-bold text-indigo-400">HOTP</span> - Counter-based OTP (event-based)
          </div>
          <div>
            <span className="font-bold text-indigo-400">Base32</span> - Required for most authenticator apps
          </div>
        </div>
      </div>
    </div>
  )
}
