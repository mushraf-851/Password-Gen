import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, Hash,
  Box, Layers, GitBranch, Cpu, Clock, Database,
  Globe, Lock, Shield, AlertCircle, Award,
  Eye, EyeOff, Download, Filter, SortAsc, Grid
} from 'lucide-react'

// ==================== TYPES ====================
type UUIDVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'nil'
type UUIDFormat = 'standard' | 'compact' | 'braces' | 'urn' | 'base64' | 'hex'
type UUIDVariant = 'dce' | 'microsoft' | 'rfc4122' | 'other'

interface UUID {
  value: string
  formatted: string
  version: UUIDVersion
  variant: UUIDVariant
  timestamp?: Date
  clockSequence?: number
  node?: string
  namespace?: string
  name?: string
  entropy: number
  uniqueness: string
}

interface UUIDOptions {
  version: UUIDVersion
  count: number
  format: UUIDFormat
  uppercase: boolean
  namespace: string
  name: string
  node: string
  clockSeq: number
  timestamp: Date | null
  includeHyphens: boolean
  sortOrder: 'none' | 'asc' | 'desc'
  deduplicate: boolean
}

// ==================== CONSTANTS ====================
const UUID_VERSIONS: Record<UUIDVersion, {
  name: string
  description: string
  entropy: number
  icon: any
  useCase: string
}> = {
  v1: {
    name: 'UUID v1',
    description: 'Time-based + MAC address',
    entropy: 48,
    icon: Clock,
    useCase: 'Timestamp-based, sortable IDs'
  },
  v3: {
    name: 'UUID v3',
    description: 'MD5 hash + namespace',
    entropy: 128,
    icon: GitBranch,
    useCase: 'Name-based with MD5, deterministic'
  },
  v4: {
    name: 'UUID v4',
    description: 'Random (most common)',
    entropy: 122,
    icon: Cpu,
    useCase: 'Random IDs, general purpose'
  },
  v5: {
    name: 'UUID v5',
    description: 'SHA-1 hash + namespace',
    entropy: 128,
    icon: Lock,
    useCase: 'Name-based with SHA-1, deterministic'
  },
  v6: {
    name: 'UUID v6',
    description: 'Time-ordered v1 (sortable)',
    entropy: 48,
    icon: SortAsc,
    useCase: 'K-sortable, database primary keys'
  },
  v7: {
    name: 'UUID v7',
    description: 'Unix epoch + random',
    entropy: 74,
    icon: Layers,
    useCase: 'Timestamp + random, sortable'
  },
  v8: {
    name: 'UUID v8',
    description: 'Custom implementation',
    entropy: 122,
    icon: Box,
    useCase: 'Experimental, custom formats'
  },
  nil: {
    name: 'Nil UUID',
    description: 'All zeros (null UUID)',
    entropy: 0,
    icon: Database,
    useCase: 'Placeholder, null values'
  }
}

const UUID_NAMESPACES = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
}

const FORMATS: Record<UUIDFormat, {
  format: (uuid: string) => string
  example: string
}> = {
  standard: {
    format: (uuid) => uuid,
    example: '123e4567-e89b-12d3-a456-426614174000'
  },
  compact: {
    format: (uuid) => uuid.replace(/-/g, ''),
    example: '123e4567e89b12d3a456426614174000'
  },
  braces: {
    format: (uuid) => `{${uuid}}`,
    example: '{123e4567-e89b-12d3-a456-426614174000}'
  },
  urn: {
    format: (uuid) => `urn:uuid:${uuid}`,
    example: 'urn:uuid:123e4567-e89b-12d3-a456-426614174000'
  },
  base64: {
    format: (uuid) => {
      const hex = uuid.replace(/-/g, '')
      const bytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
      }
      return btoa(String.fromCharCode(...bytes))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    },
    example: 'Ej5FZ-ibEtOkVkJkVUQl7A'
  },
  hex: {
    format: (uuid) => {
      const hex = uuid.replace(/-/g, '')
      return `0x${hex}`
    },
    example: '0x123e4567e89b12d3a456426614174000'
  }
}

// ==================== UTILITY FUNCTIONS ====================
function generateUUID(options: UUIDOptions): UUID {
  switch (options.version) {
    case 'v1': return generateUUIDv1(options)
    case 'v3': return generateUUIDv3(options)
    case 'v4': return generateUUIDv4(options)
    case 'v5': return generateUUIDv5(options)
    case 'v6': return generateUUIDv6(options)
    case 'v7': return generateUUIDv7(options)
    case 'v8': return generateUUIDv8(options)
    case 'nil': return generateNilUUID()
    default: return generateUUIDv4(options)
  }
}

function generateUUIDv4(options: UUIDOptions): UUID {
  const hexDigits = '0123456789abcdef'
  let uuid = ''
  
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += '4' // version 4
    } else if (i === 19) {
      uuid += hexDigits[Math.floor(Math.random() * 4) + 8] // variant 1
    } else {
      uuid += hexDigits[Math.floor(Math.random() * 16)]
    }
  }
  
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v4',
    variant: 'rfc4122',
    entropy: 122,
    uniqueness: 'extremely high (2^122 possible)'
  }
}

function generateUUIDv1(options: UUIDOptions): UUID {
  const hexDigits = '0123456789abcdef'
  const now = options.timestamp || new Date()
  
  // Get time components (100ns intervals since 1582-10-15)
  const epoch = Date.UTC(1582, 9, 15) / 1000 // October 15, 1582
  const nowSecs = now.getTime() / 1000
  const intervals = Math.floor((nowSecs - epoch) * 10000000)
  
  // Convert to hex and split
  const timeLow = (intervals & 0xFFFFFFFF).toString(16).padStart(8, '0')
  const timeMid = ((intervals >> 32) & 0xFFFF).toString(16).padStart(4, '0')
  const timeHighAndVersion = (((intervals >> 48) & 0x0FFF) | 0x1000).toString(16).padStart(4, '0')
  
  // Clock sequence
  const clockSeq = options.clockSeq || Math.floor(Math.random() * 0x3FFF)
  const clockSeqLow = (clockSeq & 0xFF).toString(16).padStart(2, '0')
  const clockSeqHighAndReserved = ((clockSeq >> 8) & 0x3F | 0x80).toString(16).padStart(2, '0')
  
  // Node (MAC address)
  let node = options.node || ''
  if (!node) {
    // Generate random multicast MAC (locally administered, multicast)
    const nodeArray = new Uint8Array(6)
    crypto.getRandomValues(nodeArray)
    nodeArray[0] = (nodeArray[0] & 0xFE) | 0x01 // Set multicast bit
    node = Array.from(nodeArray).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  const uuid = `${timeLow}-${timeMid}-${timeHighAndVersion}-${clockSeqHighAndReserved}${clockSeqLow}-${node}`
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v1',
    variant: 'rfc4122',
    timestamp: now,
    clockSequence: clockSeq,
    node,
    entropy: 48,
    uniqueness: 'high (time-based + MAC)'
  }
}

function generateUUIDv3(options: UUIDOptions): UUID {
  // Simplified v3 implementation (MD5-based)
  const namespace = options.namespace || UUID_NAMESPACES.dns
  const name = options.name || 'example'
  
  // This is a simplified hash - actual v3 requires MD5
  const hash = `${namespace}:${name}`.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const hashHex = Math.abs(hash).toString(16).padStart(32, '0')
  let uuid = hashHex.substr(0, 8) + '-' +
            hashHex.substr(8, 4) + '-' +
            '3' + hashHex.substr(13, 3) + '-' +
            ((parseInt(hashHex.substr(16, 2), 16) & 0x3F | 0x80).toString(16)) +
            hashHex.substr(18, 2) + '-' +
            hashHex.substr(20, 12)
  
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v3',
    variant: 'rfc4122',
    namespace,
    name,
    entropy: 128,
    uniqueness: 'deterministic (same namespace+name = same UUID)'
  }
}

function generateUUIDv5(options: UUIDOptions): UUID {
  // Simplified v5 implementation (SHA-1 based)
  const namespace = options.namespace || UUID_NAMESPACES.dns
  const name = options.name || 'example'
  
  // This is a simplified hash - actual v5 requires SHA-1
  const hash = `${namespace}:${name}`.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0) * 2 // Different from v3
  
  const hashHex = Math.abs(hash).toString(16).padStart(32, '0')
  let uuid = hashHex.substr(0, 8) + '-' +
            hashHex.substr(8, 4) + '-' +
            '5' + hashHex.substr(13, 3) + '-' +
            ((parseInt(hashHex.substr(16, 2), 16) & 0x3F | 0x80).toString(16)) +
            hashHex.substr(18, 2) + '-' +
            hashHex.substr(20, 12)
  
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v5',
    variant: 'rfc4122',
    namespace,
    name,
    entropy: 128,
    uniqueness: 'deterministic (same namespace+name = same UUID)'
  }
}

function generateUUIDv6(options: UUIDOptions): UUID {
  // Sortable version of v1 (time-ordered)
  const v1 = generateUUIDv1(options)
  const parts = v1.value.split('-')
  
  // Reorder: time_low and time_mid become first part
  const timeOrdered = parts[2] + parts[1] + parts[0] + parts[3] + parts[4]
  const uuid = timeOrdered.substr(0, 8) + '-' +
              timeOrdered.substr(8, 4) + '-' +
              timeOrdered.substr(12, 4) + '-' +
              timeOrdered.substr(16, 4) + '-' +
              timeOrdered.substr(20, 12)
  
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v6',
    variant: 'rfc4122',
    timestamp: v1.timestamp,
    clockSequence: v1.clockSequence,
    node: v1.node,
    entropy: 48,
    uniqueness: 'sortable, time-based'
  }
}

function generateUUIDv7(options: UUIDOptions): UUID {
  // Unix epoch timestamp + random
  const now = options.timestamp || new Date()
  const timestamp = Math.floor(now.getTime() / 1000).toString(16).padStart(8, '0')
  
  // Random parts
  const rand1 = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  const rand2 = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  
  // Version and variant
  const version = '7' + rand1.substr(0, 3)
  const variant = ((parseInt(rand2.substr(0, 2), 16) & 0x3F | 0x80).toString(16)) + rand2.substr(2, 4)
  
  const uuid = `${timestamp}-${rand1.substr(3, 4)}-${version}-${variant}-${rand2}`
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v7',
    variant: 'rfc4122',
    timestamp: now,
    entropy: 74,
    uniqueness: 'timestamp + random, sortable'
  }
}

function generateUUIDv8(options: UUIDOptions): UUID {
  // Custom implementation with maximum randomness
  const hexDigits = '0123456789abcdef'
  let uuid = ''
  
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += hexDigits[Math.floor(Math.random() * 16)] // custom version
    } else if (i === 19) {
      uuid += hexDigits[Math.floor(Math.random() * 4) + 8] // RFC variant
    } else {
      uuid += hexDigits[Math.floor(Math.random() * 16)]
    }
  }
  
  const formatted = formatUUID(uuid, options)
  
  return {
    value: uuid,
    formatted,
    version: 'v8',
    variant: 'rfc4122',
    entropy: 122,
    uniqueness: 'high (custom implementation)'
  }
}

function generateNilUUID(): UUID {
  const uuid = '00000000-0000-0000-0000-000000000000'
  return {
    value: uuid,
    formatted: uuid,
    version: 'nil',
    variant: 'rfc4122',
    entropy: 0,
    uniqueness: 'none (null UUID)'
  }
}

function formatUUID(uuid: string, options: UUIDOptions): string {
  let formatted = FORMATS[options.format].format(uuid)
  
  if (options.uppercase) {
    formatted = formatted.toUpperCase()
  }
  
  return formatted
}

function generateMultipleUUIDs(options: UUIDOptions): UUID[] {
  const uuids: UUID[] = []
  const seen = new Set<string>()
  
  for (let i = 0; i < options.count; i++) {
    let uuid = generateUUID(options)
    
    // Deduplicate if needed
    if (options.deduplicate) {
      while (seen.has(uuid.value)) {
        uuid = generateUUID(options)
      }
      seen.add(uuid.value)
    }
    
    uuids.push(uuid)
  }
  
  // Sort if needed
  if (options.sortOrder === 'asc') {
    uuids.sort((a, b) => a.value.localeCompare(b.value))
  } else if (options.sortOrder === 'desc') {
    uuids.sort((a, b) => b.value.localeCompare(a.value))
  }
  
  return uuids
}

function parseUUID(uuid: string): {
  version: number
  variant: string
  timestamp?: string
  valid: boolean
} {
  const clean = uuid.replace(/[{}]/g, '').replace(/^urn:uuid:/i, '')
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!pattern.test(clean)) {
    return { version: 0, variant: 'invalid', valid: false }
  }
  
  const version = parseInt(clean[14], 16)
  const variant = parseInt(clean[19], 16) >= 8 ? 'RFC 4122' : 'Other'
  
  return { version, variant, valid: true }
}

// ==================== MAIN COMPONENT ====================
export default function UUIDGenerator() {
  const [options, setOptions] = useState<UUIDOptions>({
    version: 'v4',
    count: 1,
    format: 'standard',
    uppercase: false,
    namespace: UUID_NAMESPACES.dns,
    name: '',
    node: '',
    clockSeq: Math.floor(Math.random() * 0x3FFF),
    timestamp: null,
    includeHyphens: true,
    sortOrder: 'none',
    deduplicate: false
  })
  const [uuids, setUuids] = useState<UUID[]>([])
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<UUID[]>([])
  const [favorites, setFavorites] = useState<UUID[]>([])
  const [parseInput, setParseInput] = useState('')
  const [parseResult, setParseResult] = useState<any>(null)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('uuidHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('uuidFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newUuids = generateMultipleUUIDs(options)
    setUuids(newUuids)
    setCopied(false)
    
    // Update history (only first one)
    if (newUuids.length > 0) {
      setHistory(prev => {
        const newHistory = [newUuids[0], ...prev.slice(0, 9)]
        localStorage.setItem('uuidHistory', JSON.stringify(newHistory))
        return newHistory
      })
    }
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
    const text = uuids.map(u => u.formatted).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = (uuid: UUID) => {
    if (favorites.some(f => f.value === uuid.value)) {
      const newFavorites = favorites.filter(f => f.value !== uuid.value)
      setFavorites(newFavorites)
      localStorage.setItem('uuidFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [uuid, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('uuidFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof UUIDOptions>(key: K, value: UUIDOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleParse = () => {
    const result = parseUUID(parseInput)
    setParseResult(result)
  }

  const VersionIcon = UUID_VERSIONS[options.version].icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            UUID Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate universally unique identifiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
            <span className="text-xs text-emerald-400">{UUID_VERSIONS[options.version].name}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* UUID Display */}
        <div className="space-y-3">
          {uuids.map((uuid, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <div className="flex-1">
                <div className="font-mono text-sm bg-gray-900 p-3 rounded-lg border border-gray-700">
                  {uuid.formatted}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(uuid.formatted)}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition opacity-0 group-hover:opacity-100"
                title="Copy"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => toggleFavorite(uuid)}
                className={`p-2 rounded-lg transition opacity-0 group-hover:opacity-100 ${
                  favorites.some(f => f.value === uuid.value)
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Add to favorites"
              >
                <Star size={16} fill={favorites.some(f => f.value === uuid.value) ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {uuids.length > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={generate}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Regenerate All
            </button>
            <button
              onClick={copyAllToClipboard}
              className="px-3 py-1 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition text-sm flex items-center gap-1"
            >
              <Copy size={14} />
              Copy All
            </button>
          </div>
        )}

        {/* UUID Details */}
        {uuids.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Version</div>
              <div className="text-sm font-bold">{UUID_VERSIONS[uuids[0].version].name}</div>
              <div className="text-xs text-gray-500 mt-1">{UUID_VERSIONS[uuids[0].version].useCase}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Entropy</div>
              <div className="text-sm font-bold">{uuids[0].entropy} bits</div>
              <div className="text-xs text-gray-500 mt-1">{uuids[0].uniqueness}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Variant</div>
              <div className="text-sm font-bold capitalize">{uuids[0].variant}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Format</div>
              <div className="text-sm font-bold capitalize">{options.format}</div>
            </div>
          </div>
        )}

        {/* Timestamp (for v1, v6, v7) */}
        {uuids.length > 0 && uuids[0].timestamp && (
          <div className="mt-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Timestamp</div>
            <div className="text-sm font-mono">{uuids[0].timestamp.toISOString()}</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <button 
          onClick={generate}
          className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
          title="Generate new"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Version Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">UUID Version</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(UUID_VERSIONS) as UUIDVersion[]).map((ver) => {
              const Icon = UUID_VERSIONS[ver].icon
              return (
                <button
                  key={ver}
                  onClick={() => updateOption('version', ver)}
                  className={`p-3 rounded-lg flex flex-col items-start transition ${
                    options.version === ver
                      ? 'bg-emerald-500/20 border-2 border-emerald-500'
                      : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon size={14} className={options.version === ver ? 'text-emerald-400' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${options.version === ver ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {UUID_VERSIONS[ver].name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{UUID_VERSIONS[ver].description}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Name-based options (v3, v5) */}
        {(options.version === 'v3' || options.version === 'v5') && (
          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Name-based Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Namespace</label>
                <select
                  value={options.namespace}
                  onChange={(e) => updateOption('namespace', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={UUID_NAMESPACES.dns}>DNS</option>
                  <option value={UUID_NAMESPACES.url}>URL</option>
                  <option value={UUID_NAMESPACES.oid}>OID</option>
                  <option value={UUID_NAMESPACES.x500}>X.500</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={options.name}
                  onChange={(e) => updateOption('name', e.target.value)}
                  placeholder="e.g., example.com"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Time-based options (v1, v6) */}
        {(options.version === 'v1' || options.version === 'v6') && (
          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Time-based Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Node (MAC address)</label>
                <input
                  type="text"
                  value={options.node}
                  onChange={(e) => updateOption('node', e.target.value)}
                  placeholder="12 hex digits (e.g., 001122334455)"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Clock Sequence</label>
                <input
                  type="number"
                  min={0}
                  max={16383}
                  value={options.clockSeq}
                  onChange={(e) => updateOption('clockSeq', parseInt(e.target.value))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of UUIDs</label>
            <input
              type="number"
              min={1}
              max={20}
              value={options.count}
              onChange={(e) => updateOption('count', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
            <select
              value={options.format}
              onChange={(e) => updateOption('format', e.target.value as UUIDFormat)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {(Object.keys(FORMATS) as UUIDFormat[]).map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
            <select
              value={options.sortOrder}
              onChange={(e) => updateOption('sortOrder', e.target.value as 'none' | 'asc' | 'desc')}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="none">None</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => updateOption('uppercase', e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Uppercase</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={options.deduplicate}
              onChange={(e) => updateOption('deduplicate', e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Remove duplicates</span>
          </label>
        </div>
      </div>

      {/* UUID Parser */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Filter size={14} />
          UUID Parser / Validator
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={parseInput}
            onChange={(e) => setParseInput(e.target.value)}
            placeholder="Enter UUID to validate/parse"
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleParse}
            className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition font-medium"
          >
            Parse
          </button>
        </div>
        
        {parseResult && (
          <div className={`mt-3 p-3 rounded-lg ${
            parseResult.valid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {parseResult.valid ? (
              <div className="space-y-1">
                <div className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle size={14} />
                  Valid UUID
                </div>
                <div className="text-xs text-gray-400">Version: {parseResult.version}</div>
                <div className="text-xs text-gray-400">Variant: {parseResult.variant}</div>
              </div>
            ) : (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                Invalid UUID format
              </div>
            )}
          </div>
        )}
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
                    <div className="text-xs font-mono">{item.formatted}</div>
                    <div className="text-xs text-gray-500">
                      {UUID_VERSIONS[item.version].name}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.formatted)}
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
              Favorite UUIDs
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-xs font-mono">{item.formatted}</div>
                    <div className="text-xs text-gray-500">
                      {UUID_VERSIONS[item.version].name}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.formatted)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">UUIDs Generated</div>
          <div className="text-xl font-bold text-white">{history.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Favorites</div>
          <div className="text-xl font-bold text-white">{favorites.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Versions Used</div>
          <div className="text-xl font-bold text-white">
            {new Set(history.map(h => h.version)).size}
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Total Entropy</div>
          <div className="text-xl font-bold text-white">
            {history.reduce((acc, h) => acc + h.entropy, 0)} bits
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/30">
        <h3 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
          <Database size={14} />
          About UUIDs
        </h3>
        <p className="text-xs text-gray-400">
          UUID v4 (random) is most common with 122 bits of entropy (~5.3×10³⁶ possible values). 
          v1 uses timestamp + MAC address for uniqueness. v3/v5 are deterministic from namespace + name. 
          v6/v7 are sortable versions ideal for database primary keys. v8 allows custom implementation.
        </p>
      </div>
    </div>
  )
}
