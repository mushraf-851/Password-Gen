import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, Wifi, 
  Shield, Lock, Key, Signal, Zap, Globe, Smartphone,
  Laptop, Radio, AlertCircle, CheckCircle, Settings,
  Award,
  QrCode, Download, Eye, EyeOff, Server, Activity
} from 'lucide-react'

// ==================== TYPES ====================
type WiFiEncryption = 'WEP' | 'WPA' | 'WPA2' | 'WPA3' | 'WPA2-Enterprise' | 'WPA3-Enterprise' | 'None'
type WiFiBand = '2.4GHz' | '5GHz' | '6GHz' | 'Dual-Band' | 'Tri-Band'
type WiFiStandard = '802.11a' | '802.11b' | '802.11g' | '802.11n' | '802.11ac' | '802.11ax' | '802.11be'
type SecurityLevel = 'weak' | 'fair' | 'good' | 'strong' | 'excellent'

interface WiFiNetwork {
  ssid: string
  password: string
  encryption: WiFiEncryption
  band: WiFiBand
  standard: WiFiStandard
  channel: number
  frequency: number
  security: SecurityLevel
  strength: number
  hidden: boolean
  wps: boolean
  guest: boolean
  macFiltering: boolean
  qos: boolean
  muMimo: boolean
  ofdma: boolean
  bitrate: number
  range: string
}

interface WiFiOptions {
  encryption: WiFiEncryption
  length: number
  includeSpecialChars: boolean
  includeNumbers: boolean
  includeUppercase: boolean
  includeLowercase: boolean
  band: WiFiBand
  standard: WiFiStandard
  hidden: boolean
  guest: boolean
  wps: boolean
  macFiltering: boolean
  qos: boolean
  customSSID: string
  ssidPrefix: string
}

// ==================== CONSTANTS ====================
const SSID_PREFIXES = [
  'Home', 'Office', 'Guest', 'WiFi', 'Network', 'Internet',
  'Fiber', 'Broadband', 'Wireless', 'Hotspot', 'Router', 'Gateway',
  'Sky', 'Star', 'Light', 'Wave', 'Link', 'Connect',
  'Family', 'House', 'Apartment', 'Loft', 'Studio', 'Villa',
  'Tech', 'Digital', 'Smart', 'Cyber', 'Net', 'Web'
]

const SSID_SUFFIXES = [
  'Network', 'WiFi', 'Internet', 'Wireless', 'Hotspot', 'LAN',
  '5G', '6G', 'Plus', 'Pro', 'Max', 'Ultra',
  'Home', 'Office', 'Guest', 'Lab', 'Studio', 'Space'
]

const FUNNY_SSIDS = [
  'Pretty Fly for a WiFi',
  'The Promised LAN',
  'FBI Surveillance Van',
  'Drop It Like Its Hotspot',
  'Wu-Tang LAN',
  'Skynet',
  'DARPA',
  'NSA',
  'Area 51',
  'Mom Click Here for Internet',
  'Hide Yo Kids Hide Yo WiFi',
  'Martin Router King',
  'LAN Solo',
  'House LANister',
  'The LAN Before Time',
  'WiFi Velociraptor',
  '404 Network Unavailable',
  'This LAN is on Fire',
  'Loading...',
  'WiFiNameHere',
  'It Burns When IP',
  'No More WiFi',
  'Unlimited WiFi',
  'Free WiFi (Not Really)',
  'Virus Distribution Center'
]

const ENCRYPTION_DETAILS: Record<WiFiEncryption, {
  security: SecurityLevel
  description: string
  keyLength: number[]
  vulnerabilities: string[]
  recommended: boolean
}> = {
  'None': {
    security: 'weak',
    description: 'Open network with no encryption',
    keyLength: [0],
    vulnerabilities: ['Anyone can connect', 'Traffic is visible to all'],
    recommended: false
  },
  'WEP': {
    security: 'weak',
    description: 'Wired Equivalent Privacy (deprecated)',
    keyLength: [5, 13, 16],
    vulnerabilities: ['Easily cracked in minutes', 'RC4 encryption is broken'],
    recommended: false
  },
  'WPA': {
    security: 'fair',
    description: 'Wi-Fi Protected Access (legacy)',
    keyLength: [8, 16, 24, 32],
    vulnerabilities: ['TKIP vulnerabilities', 'Can be cracked with dictionary attacks'],
    recommended: false
  },
  'WPA2': {
    security: 'good',
    description: 'Wi-Fi Protected Access 2 (current standard)',
    keyLength: [8, 16, 24, 32, 63],
    vulnerabilities: ['KRACK vulnerability (patched)', 'Weak password vulnerable to dictionary'],
    recommended: true
  },
  'WPA3': {
    security: 'strong',
    description: 'Wi-Fi Protected Access 3 (latest standard)',
    keyLength: [8, 16, 24, 32, 63],
    vulnerabilities: ['Few known', 'Dragonblood (partial, patched)'],
    recommended: true
  },
  'WPA2-Enterprise': {
    security: 'excellent',
    description: 'WPA2 with 802.1X authentication',
    keyLength: [8, 16, 24, 32, 63],
    vulnerabilities: ['Requires RADIUS server', 'Certificate management needed'],
    recommended: true
  },
  'WPA3-Enterprise': {
    security: 'excellent',
    description: 'WPA3 with 192-bit security',
    keyLength: [8, 16, 24, 32, 63],
    vulnerabilities: ['Requires modern hardware', 'Complex setup'],
    recommended: true
  }
}

const STANDARD_DETAILS: Record<WiFiStandard, {
  year: number
  speed: string
  band: string[]
  description: string
}> = {
  '802.11a': { year: 1999, speed: '54 Mbps', band: ['5GHz'], description: 'Original 5GHz standard' },
  '802.11b': { year: 1999, speed: '11 Mbps', band: ['2.4GHz'], description: 'Original 2.4GHz standard' },
  '802.11g': { year: 2003, speed: '54 Mbps', band: ['2.4GHz'], description: 'Combined a and b features' },
  '802.11n': { year: 2009, speed: '600 Mbps', band: ['2.4GHz', '5GHz'], description: 'Wi-Fi 4 - MIMO introduced' },
  '802.11ac': { year: 2014, speed: '1.3 Gbps', band: ['5GHz'], description: 'Wi-Fi 5 - MU-MIMO' },
  '802.11ax': { year: 2019, speed: '9.6 Gbps', band: ['2.4GHz', '5GHz', '6GHz'], description: 'Wi-Fi 6 - OFDMA' },
  '802.11be': { year: 2024, speed: '40 Gbps', band: ['2.4GHz', '5GHz', '6GHz'], description: 'Wi-Fi 7 - Multi-link operation' }
}

const CHANNELS: Record<string, number[]> = {
  '2.4GHz': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  '5GHz': [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
  '6GHz': [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137, 141, 145, 149, 153, 157, 161, 165, 169, 173, 177, 181, 185, 189, 193, 197, 201, 205, 209, 213, 217, 221, 225, 229, 233]
}

const SECURITY_LEVELS: Record<SecurityLevel, { color: string; icon: any }> = {
  weak: { color: '#ef4444', icon: AlertCircle },
  fair: { color: '#f59e0b', icon: Shield },
  good: { color: '#3b82f6', icon: Lock },
  strong: { color: '#10b981', icon: Key },
  excellent: { color: '#8b5cf6', icon: Award }
}

// ==================== UTILITY FUNCTIONS ====================
function generateWiFiPassword(options: WiFiOptions): string {
  let chars = ''
  if (options.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.includeNumbers) chars += '0123456789'
  if (options.includeSpecialChars) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  return Array.from(array, (v) => chars[v % chars.length]).join('')
}

function generateSSID(options: WiFiOptions): string {
  if (options.customSSID) return options.customSSID
  
  const useFunny = Math.random() > 0.7
  if (useFunny) {
    return FUNNY_SSIDS[Math.floor(Math.random() * FUNNY_SSIDS.length)]
  }
  
  const prefix = options.ssidPrefix || SSID_PREFIXES[Math.floor(Math.random() * SSID_PREFIXES.length)]
  const suffix = SSID_SUFFIXES[Math.floor(Math.random() * SSID_SUFFIXES.length)]
  const number = Math.floor(Math.random() * 100)
  
  const patterns = [
    `${prefix} ${suffix}`,
    `${prefix}${number}`,
    `${prefix} WiFi`,
    `${suffix} Network`,
    `${prefix} ${number}`,
    `${prefix}-${suffix}`
  ]
  
  return patterns[Math.floor(Math.random() * patterns.length)]
}

function generateWiFiNetwork(options: WiFiOptions): WiFiNetwork {
  const ssid = generateSSID(options)
  const password = generateWiFiPassword(options)
  const encryption = options.encryption
  const band = options.band
  const standard = options.standard
  
  // Get available channels for the band
  const bandKey = band.includes('2.4') ? '2.4GHz' : band.includes('5') ? '5GHz' : '6GHz'
  const availableChannels = CHANNELS[bandKey] || CHANNELS['2.4GHz']
  const channel = availableChannels[Math.floor(Math.random() * availableChannels.length)]
  
  // Calculate frequency
  let frequency = 0
  if (bandKey === '2.4GHz') frequency = 2412 + (channel - 1) * 5
  else if (bandKey === '5GHz') frequency = 5000 + channel * 5
  else frequency = 6000 + channel * 5
  
  // Determine signal strength
  const strength = Math.floor(Math.random() * 30) + 70 // 70-100%
  
  // Get security level from encryption
  const security = ENCRYPTION_DETAILS[encryption].security
  
  // Calculate approximate range
  let range = ''
  if (bandKey === '2.4GHz') range = '~50-100m indoor'
  else if (bandKey === '5GHz') range = '~30-50m indoor'
  else range = '~15-30m indoor'
  
  // Get bitrate from standard
  const standardInfo = STANDARD_DETAILS[standard]
  const bitrateMatch = standardInfo.speed.match(/\d+/)
  const bitrate = bitrateMatch ? parseInt(bitrateMatch[0]) * (standardInfo.speed.includes('G') ? 1000 : 1) : 100
  
  return {
    ssid,
    password,
    encryption,
    band,
    standard,
    channel,
    frequency,
    security,
    strength,
    hidden: options.hidden,
    wps: options.wps,
    guest: options.guest,
    macFiltering: options.macFiltering,
    qos: options.qos,
    muMimo: standard === '802.11ac' || standard === '802.11ax' || standard === '802.11be',
    ofdma: standard === '802.11ax' || standard === '802.11be',
    bitrate,
    range
  }
}

function getPasswordStrength(password: string): {
  score: number
  level: SecurityLevel
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 20) {
    score += 40
    feedback.push('✓ Excellent length')
  } else if (password.length >= 15) {
    score += 30
    feedback.push('✓ Good length')
  } else if (password.length >= 12) {
    score += 20
    feedback.push('✓ Adequate length')
  } else if (password.length >= 8) {
    score += 10
    feedback.push('⚠️ Minimum length - consider longer')
  } else {
    feedback.push('❌ Too short - vulnerable to brute force')
  }
  
  // Character variety
  if (/[a-z]/.test(password)) {
    score += 10
    feedback.push('✓ Contains lowercase')
  }
  if (/[A-Z]/.test(password)) {
    score += 10
    feedback.push('✓ Contains uppercase')
  }
  if (/[0-9]/.test(password)) {
    score += 15
    feedback.push('✓ Contains numbers')
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 25
    feedback.push('✓ Contains special characters')
  }
  
  // Check for patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
    feedback.push('⚠️ Avoid repeating characters')
  }
  if (/123|234|345|456|567|678|789|890/.test(password)) {
    score -= 10
    feedback.push('⚠️ Avoid sequential numbers')
  }
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/.test(password)) {
    score -= 10
    feedback.push('⚠️ Avoid sequential letters')
  }
  
  // Determine level
  let level: SecurityLevel = 'weak'
  if (score >= 80) level = 'excellent'
  else if (score >= 60) level = 'strong'
  else if (score >= 40) level = 'good'
  else if (score >= 20) level = 'fair'
  
  return { score: Math.min(100, Math.max(0, score)), level, feedback }
}

function generateQRCodeData(network: WiFiNetwork): string {
  // WiFi QR code format: WIFI:S:<SSID>;T:<WEP|WPA|WPA2|WPA3|nopass>;P:<password>;H:<hidden>;;
  const encryption = network.encryption === 'None' ? 'nopass' : network.encryption
  const hidden = network.hidden ? 'true' : 'false'
  return `WIFI:S:${network.ssid};T:${encryption};P:${network.password};H:${hidden};;`
}

// ==================== MAIN COMPONENT ====================
export default function WiFiGenerator() {
  const [options, setOptions] = useState<WiFiOptions>({
    encryption: 'WPA2',
    length: 16,
    includeSpecialChars: true,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true,
    band: 'Dual-Band',
    standard: '802.11ax',
    hidden: false,
    guest: false,
    wps: true,
    macFiltering: false,
    qos: true,
    customSSID: '',
    ssidPrefix: ''
  })
  const [network, setNetwork] = useState<WiFiNetwork | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<WiFiNetwork[]>([])
  const [favorites, setFavorites] = useState<WiFiNetwork[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; level: SecurityLevel; feedback: string[] } | null>(null)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('wifiHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('wifiFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newNetwork = generateWiFiNetwork(options)
    setNetwork(newNetwork)
    setPasswordStrength(getPasswordStrength(newNetwork.password))
    setCopied(false)
    
    setHistory(prev => {
      const newHistory = [newNetwork, ...prev.slice(0, 9)]
      localStorage.setItem('wifiHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }, [options])

  useEffect(() => {
    generate()
  }, [options])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAllToClipboard = async () => {
    if (!network) return
    const text = `SSID: ${network.ssid}\nPassword: ${network.password}\nEncryption: ${network.encryption}\nBand: ${network.band}\nChannel: ${network.channel} (${network.frequency} MHz)`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    if (!network) return
    
    if (favorites.some(f => f.ssid === network.ssid && f.password === network.password)) {
      const newFavorites = favorites.filter(f => !(f.ssid === network.ssid && f.password === network.password))
      setFavorites(newFavorites)
      localStorage.setItem('wifiFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [network, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('wifiFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof WiFiOptions>(key: K, value: WiFiOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const SecurityIcon = network ? SECURITY_LEVELS[network.security].icon : Shield

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            WiFi Password Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate secure passwords for your wireless network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/30">
            <span className="text-xs text-yellow-400">{options.encryption} · {options.band}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {network && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          {/* Network Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Wifi size={32} className="text-black" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{network.ssid}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Signal size={14} />
                <span>Signal: {network.strength}%</span>
                <span>•</span>
                <span>Channel {network.channel}</span>
                <span>•</span>
                <span>{network.frequency} MHz</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={generate}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
                title="Generate new"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button 
                onClick={() => setShowQR(!showQR)}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                title="Show QR Code"
              >
                <QrCode size={20} />
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-3 rounded-lg transition ${
                  favorites.some(f => f.ssid === network.ssid && f.password === network.password)
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Add to favorites"
              >
                <Star size={20} fill={favorites.some(f => f.ssid === network.ssid && f.password === network.password) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Password Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Network Password</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={network.password}
                  readOnly
                  className="w-full font-mono text-xl bg-gray-900 p-4 pr-12 rounded-lg border-2 border-gray-700"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(network.password)}
                className="p-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {passwordStrength && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${passwordStrength.score}%`,
                        backgroundColor: SECURITY_LEVELS[passwordStrength.level].color
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: SECURITY_LEVELS[passwordStrength.level].color }}>
                  {passwordStrength.level} ({passwordStrength.score}%)
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {passwordStrength.feedback.map((fb, i) => (
                  <div key={i} className="text-xs text-gray-400 flex items-center gap-1">
                    {fb.startsWith('✓') && <CheckCircle size={12} className="text-green-400" />}
                    {fb.startsWith('⚠') && <AlertCircle size={12} className="text-yellow-400" />}
                    {fb.startsWith('❌') && <AlertCircle size={12} className="text-red-400" />}
                    {fb}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {showQR && (
            <div className="mb-6 p-4 bg-white rounded-lg flex flex-col items-center">
              <div className="text-black mb-2 font-mono text-sm">
                {generateQRCodeData(network)}
              </div>
              <button
                onClick={() => copyToClipboard(generateQRCodeData(network))}
                className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition text-sm"
              >
                Copy QR Code Data
              </button>
            </div>
          )}

          {/* Network Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Encryption</div>
              <div className="text-sm font-bold">{network.encryption}</div>
              <div className="text-xs text-gray-500 mt-1">{ENCRYPTION_DETAILS[network.encryption].description}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Standard</div>
              <div className="text-sm font-bold">{network.standard}</div>
              <div className="text-xs text-gray-500 mt-1">{STANDARD_DETAILS[network.standard].speed}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Band</div>
              <div className="text-sm font-bold">{network.band}</div>
              <div className="text-xs text-gray-500 mt-1">{network.range}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Features</div>
              <div className="flex flex-wrap gap-1">
                {network.muMimo && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">MU-MIMO</span>}
                {network.ofdma && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">OFDMA</span>}
                {network.qos && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">QoS</span>}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="mt-4 flex flex-wrap gap-2">
            {network.hidden && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                Hidden Network
              </span>
            )}
            {network.guest && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                Guest Network
              </span>
            )}
            {network.wps && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                WPS Enabled
              </span>
            )}
            {network.macFiltering && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                MAC Filtering
              </span>
            )}
          </div>

          {/* Copy All Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={copyAllToClipboard}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm"
            >
              <Copy size={16} />
              Copy All Details
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Encryption Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Encryption Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['None', 'WEP', 'WPA', 'WPA2', 'WPA3', 'WPA2-Enterprise', 'WPA3-Enterprise'] as WiFiEncryption[]).map((enc) => {
              const details = ENCRYPTION_DETAILS[enc]
              return (
                <button
                  key={enc}
                  onClick={() => updateOption('encryption', enc)}
                  className={`p-3 rounded-lg flex flex-col items-start transition ${
                    options.encryption === enc
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Lock size={14} className={options.encryption === enc ? 'text-yellow-400' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${options.encryption === enc ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {enc}
                    </span>
                  </div>
                  {!details.recommended && (
                    <span className="text-xs text-red-400 mt-1">Not recommended</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Password Options */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Password Settings</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Length: {options.length}</label>
              <div className="flex gap-1">
                {[8, 12, 16, 20, 24, 32, 63].map(l => (
                  <button
                    key={l}
                    onClick={() => updateOption('length', l)}
                    className={`px-2 py-1 text-xs rounded ${
                      options.length === l 
                        ? 'bg-yellow-500 text-black font-bold' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <input 
              type="range" 
              min={8} 
              max={63} 
              value={options.length} 
              onChange={(e) => updateOption('length', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.includeLowercase}
                onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Lowercase</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.includeUppercase}
                onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Uppercase</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.includeNumbers}
                onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Numbers</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.includeSpecialChars}
                onChange={(e) => updateOption('includeSpecialChars', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Special Chars</span>
            </label>
          </div>
        </div>

        {/* Network Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Band Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Band</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['2.4GHz', '5GHz', '6GHz', 'Dual-Band', 'Tri-Band'] as WiFiBand[]).map(b => (
                <button
                  key={b}
                  onClick={() => updateOption('band', b)}
                  className={`p-2 rounded-lg text-xs ${
                    options.band === b
                      ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Standard</h3>
            <select
              value={options.standard}
              onChange={(e) => updateOption('standard', e.target.value as WiFiStandard)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              {(['802.11a', '802.11b', '802.11g', '802.11n', '802.11ac', '802.11ax', '802.11be'] as WiFiStandard[]).map(s => (
                <option key={s} value={s}>{s} - {STANDARD_DETAILS[s].speed}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SSID Settings */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Network Name (SSID)</h3>
          <div className="flex gap-2">
            <div className="flex-1">
            <label htmlFor="wifi-custom-ssid" className="sr-only">Custom SSID (optional)</label>
            <input
              id="wifi-custom-ssid"
              name="wifi-custom-ssid"
              type="text"
              value={options.customSSID}
              onChange={(e) => updateOption('customSSID', e.target.value)}
              placeholder="Custom SSID (optional)"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
            <div>
              <label htmlFor="wifi-ssid-prefix" className="sr-only">Prefix (optional)</label>
              <input
                id="wifi-ssid-prefix"
                name="wifi-ssid-prefix"
                type="text"
                value={options.ssidPrefix}
                onChange={(e) => updateOption('ssidPrefix', e.target.value)}
                placeholder="Prefix (optional)"
                className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Advanced Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.hidden}
                onChange={(e) => updateOption('hidden', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Hidden SSID</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.guest}
                onChange={(e) => updateOption('guest', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">Guest Network</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.wps}
                onChange={(e) => updateOption('wps', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">WPS Enabled</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={options.macFiltering}
                onChange={(e) => updateOption('macFiltering', e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-gray-300 group-hover:text-white transition">MAC Filtering</span>
            </label>
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
              {history.map((net, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="font-medium">{net.ssid}</div>
                    <div className="text-xs text-gray-500 font-mono">{net.password}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(net.password)}
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
              Favorite Networks
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((net, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="font-medium">{net.ssid}</div>
                    <div className="text-xs text-gray-500 font-mono">{net.password}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(net.password)}
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

      {/* Stats */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Activity size={14} />
          Network Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Networks Generated</div>
            <div className="text-lg font-bold text-white">{history.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Favorite Networks</div>
            <div className="text-lg font-bold text-white">{favorites.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Password Strength</div>
            <div className="text-lg font-bold text-yellow-400">
              {history.length > 0 
                ? Math.round(history.reduce((acc, net) => acc + getPasswordStrength(net.password).score, 0) / history.length)
                : 0}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Most Used Encryption</div>
            <div className="text-lg font-bold text-white">
              {history.length > 0
                ? Object.entries(history.reduce((acc, net) => {
                    acc[net.encryption] = (acc[net.encryption] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0]
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-800 pt-4">
        <AlertCircle size={12} className="inline mr-1 text-yellow-500" />
        Use strong passwords (WPA2/WPA3) and avoid WEP or open networks for better security.
      </div>
    </div>
  )
}
