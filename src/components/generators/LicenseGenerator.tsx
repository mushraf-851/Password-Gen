import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, Car,
  MapPin, Globe, Flag, Hash, Truck, Bike,
  Plane, Ship, Train, AlertCircle, Award,
  Eye, EyeOff, Download, Filter, Calendar
} from 'lucide-react'

// ==================== TYPES ====================
type LicenseCountry = 'us' | 'uk' | 'eu' | 'jp' | 'cn' | 'in' | 'br' | 'ru' | 'au' | 'ca' | 'de' | 'fr' | 'it' | 'es' | 'custom'
type LicenseType = 'standard' | 'vanity' | 'commercial' | 'motorcycle' | 'trailer' | 'diplomat' | 'military' | 'temporary'
type VehicleType = 'car' | 'motorcycle' | 'truck' | 'bus' | 'trailer' | 'taxi' | 'government' | 'diplomat'

interface LicensePlate {
  plate: string
  formatted: string
  country: LicenseCountry
  type: LicenseType
  vehicle: VehicleType
  region: string
  year: number
  expires?: Date
  registeredTo?: string
  restrictions?: string[]
  features: {
    hasFlag: boolean
    hasEU: boolean
    hasEmoji: boolean
    isPersonalized: boolean
    isVeteran: boolean
    isElectric: boolean
  }
}

interface LicenseOptions {
  country: LicenseCountry
  type: LicenseType
  vehicle: VehicleType
  year: number
  personalized: string
  pattern: string
  includeFlag: boolean
  includeYear: boolean
  includeRegion: boolean
  count: number
  format: 'standard' | 'spaced' | 'hyphenated'
}

// ==================== CONSTANTS ====================
const COUNTRIES: Record<LicenseCountry, {
  name: string
  flag: string
  pattern: string
  example: string
  format: (plate: string) => string
  regions: string[]
}> = {
  us: {
    name: 'United States',
    flag: '🇺🇸',
    pattern: 'ABC 1234',
    example: 'ABC 1234',
    format: (plate) => plate.replace(/([A-Z]{3})(\d{4})/, '$1 $2'),
    regions: ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'Michigan', 'North Carolina']
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    pattern: 'AB12 CDE',
    example: 'AB12 CDE',
    format: (plate) => plate.replace(/([A-Z]{2})(\d{2})([A-Z]{3})/, '$1$2 $3'),
    regions: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  eu: {
    name: 'European Union',
    flag: '🇪🇺',
    pattern: 'AB-123-CD',
    example: 'AB-123-CD',
    format: (plate) => plate.replace(/([A-Z]{2})(\d{3})([A-Z]{2})/, '$1-$2-$3'),
    regions: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Poland']
  },
  jp: {
    name: 'Japan',
    flag: '🇯🇵',
    pattern: '12-34',
    example: '12-34',
    format: (plate) => plate.replace(/(\d{2})(\d{2})/, '$1-$2'),
    regions: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fukuoka', 'Nagoya', 'Sapporo', 'Yokohama']
  },
  cn: {
    name: 'China',
    flag: '🇨🇳',
    pattern: '京A 12345',
    example: '京A 12345',
    format: (plate) => plate,
    regions: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', 'Xi\'an', 'Hangzhou']
  },
  in: {
    name: 'India',
    flag: '🇮🇳',
    pattern: 'AB 12 CD 1234',
    example: 'AB 12 CD 1234',
    format: (plate) => plate,
    regions: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
  },
  br: {
    name: 'Brazil',
    flag: '🇧🇷',
    pattern: 'ABC1D23',
    example: 'ABC1D23',
    format: (plate) => plate.replace(/([A-Z]{3})(\d{1})([A-Z]{1})(\d{2})/, '$1$2$3$4'),
    regions: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul']
  },
  ru: {
    name: 'Russia',
    flag: '🇷🇺',
    pattern: 'А123ВС 777',
    example: 'А123ВС 777',
    format: (plate) => plate,
    regions: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Sochi']
  },
  au: {
    name: 'Australia',
    flag: '🇦🇺',
    pattern: 'ABC-123',
    example: 'ABC-123',
    format: (plate) => plate.replace(/([A-Z]{3})(\d{3})/, '$1-$2'),
    regions: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
  },
  ca: {
    name: 'Canada',
    flag: '🇨🇦',
    pattern: 'ABC 123',
    example: 'ABC 123',
    format: (plate) => plate.replace(/([A-Z]{3})(\d{3})/, '$1 $2'),
    regions: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan']
  },
  de: {
    name: 'Germany',
    flag: '🇩🇪',
    pattern: 'AB CD 123',
    example: 'AB CD 123',
    format: (plate) => plate.replace(/([A-Z]{2})([A-Z]{2})(\d{3})/, '$1 $2 $3'),
    regions: ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Hesse']
  },
  fr: {
    name: 'France',
    flag: '🇫🇷',
    pattern: 'AB-123-CD',
    example: 'AB-123-CD',
    format: (plate) => plate.replace(/([A-Z]{2})(\d{3})([A-Z]{2})/, '$1-$2-$3'),
    regions: ['Île-de-France', 'Provence', 'Rhône-Alpes', 'Aquitaine', 'Brittany', 'Normandy']
  },
  it: {
    name: 'Italy',
    flag: '🇮🇹',
    pattern: 'AB 123 CD',
    example: 'AB 123 CD',
    format: (plate) => plate.replace(/([A-Z]{2})(\d{3})([A-Z]{2})/, '$1 $2 $3'),
    regions: ['Lazio', 'Lombardy', 'Campania', 'Sicily', 'Veneto', 'Piedmont']
  },
  es: {
    name: 'Spain',
    flag: '🇪🇸',
    pattern: '1234 ABC',
    example: '1234 ABC',
    format: (plate) => plate.replace(/(\d{4})([A-Z]{3})/, '$1 $2'),
    regions: ['Madrid', 'Catalonia', 'Andalusia', 'Valencia', 'Galicia', 'Basque Country']
  },
  custom: {
    name: 'Custom',
    flag: '🏁',
    pattern: 'CUSTOM',
    example: 'CUSTOM01',
    format: (plate) => plate,
    regions: ['Custom Region']
  }
}

const VEHICLE_TYPES: Record<VehicleType, { icon: any; suffix: string }> = {
  car: { icon: Car, suffix: '' },
  motorcycle: { icon: Bike, suffix: 'M' },
  truck: { icon: Truck, suffix: 'T' },
  bus: { icon: Bus, suffix: 'B' },
  trailer: { icon: Truck, suffix: 'TR' },
  taxi: { icon: Car, suffix: 'TX' },
  government: { icon: Car, suffix: 'GV' },
  diplomat: { icon: Globe, suffix: 'DL' }
}

const LICENSE_TYPES: Record<LicenseType, { description: string; color: string }> = {
  standard: { description: 'Standard issue', color: 'blue' },
  vanity: { description: 'Personalized plate', color: 'purple' },
  commercial: { description: 'Commercial vehicle', color: 'orange' },
  motorcycle: { description: 'Motorcycle plate', color: 'green' },
  trailer: { description: 'Trailer plate', color: 'yellow' },
  diplomat: { description: 'Diplomatic plate', color: 'red' },
  military: { description: 'Military vehicle', color: 'brown' },
  temporary: { description: 'Temporary plate', color: 'gray' }
}

const YEARS = Array.from({ length: 30 }, (_, i) => 2020 - i)

// ==================== UTILITY FUNCTIONS ====================
function generateLicensePlate(options: LicenseOptions): LicensePlate {
  const country = COUNTRIES[options.country]
  const pattern = options.pattern || country.pattern
  
  let plate = ''
  
  if (options.personalized) {
    // Use personalized plate
    plate = options.personalized.toUpperCase()
  } else {
    // Generate random plate based on pattern
    plate = pattern.split('').map(char => {
      if (char === 'A' || char === 'B' || char === 'C' || char === 'D') {
        // Random letter
        return String.fromCharCode(65 + Math.floor(Math.random() * 26))
      } else if (char === '1' || char === '2' || char === '3' || char === '4') {
        // Random number
        return Math.floor(Math.random() * 10).toString()
      } else if (char === '京' || char === '沪' || char === '粤') {
        // Chinese province codes
        const provinces = ['京', '沪', '粤', '苏', '浙', '鲁', '川', '鄂']
        return provinces[Math.floor(Math.random() * provinces.length)]
      } else if (char === 'А' || char === 'В' || char === 'С') {
        // Russian letters (simplified - using Latin look-alikes)
        const russian = ['A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X']
        return russian[Math.floor(Math.random() * russian.length)]
      } else {
        // Keep the character (space, hyphen, etc.)
        return char
      }
    }).join('')
  }
  
  // Add vehicle type suffix if applicable
  if (options.vehicle !== 'car') {
    const suffix = VEHICLE_TYPES[options.vehicle].suffix
    if (suffix) {
      plate = plate + suffix
    }
  }
  
  // Apply country-specific formatting
  const formatted = country.format(plate)
  
  // Determine region
  const region = country.regions[Math.floor(Math.random() * country.regions.length)]
  
  // Calculate expiry (3-5 years from now)
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 3 + Math.floor(Math.random() * 3))
  
  return {
    plate,
    formatted,
    country: options.country,
    type: options.type,
    vehicle: options.vehicle,
    region,
    year: options.year,
    expires,
    registeredTo: `Owner ${Math.floor(Math.random() * 10000)}`,
    restrictions: options.type === 'commercial' ? ['Commercial use only'] : [],
    features: {
      hasFlag: options.includeFlag,
      hasEU: options.country === 'eu',
      hasEmoji: Math.random() > 0.7,
      isPersonalized: !!options.personalized,
      isVeteran: options.year < 2000,
      isElectric: Math.random() > 0.9
    }
  }
}

function generateMultiplePlates(options: LicenseOptions): LicensePlate[] {
  const plates: LicensePlate[] = []
  const seen = new Set<string>()
  
  for (let i = 0; i < options.count; i++) {
    let plate = generateLicensePlate(options)
    
    // Ensure uniqueness
    while (seen.has(plate.plate)) {
      plate = generateLicensePlate(options)
    }
    seen.add(plate.plate)
    
    plates.push(plate)
  }
  
  return plates
}

function getPlateStyle(plate: LicensePlate): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    border: '2px solid #333',
    borderRadius: '4px',
    color: '#000',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    padding: '8px 16px',
    textTransform: 'uppercase'
  }
  
  if (plate.country === 'us') {
    baseStyle.background = 'linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 100%)'
    baseStyle.border = '2px solid #0066b3'
  } else if (plate.country === 'uk') {
    baseStyle.background = 'linear-gradient(135deg, #f5f5f5 0%, #ffd700 100%)'
    baseStyle.border = '2px solid #c8102e'
  } else if (plate.country === 'eu') {
    baseStyle.background = 'linear-gradient(135deg, #003399 0%, #ffcc00 100%)'
    baseStyle.color = '#fff'
    baseStyle.border = '2px solid #fff'
  } else if (plate.country === 'jp') {
    baseStyle.background = 'linear-gradient(135deg, #f5f5f5 0%, #9acd32 100%)'
    baseStyle.border = '2px solid #8b4513'
  } else if (plate.country === 'cn') {
    baseStyle.background = 'linear-gradient(135deg, #ff0000 0%, #ffd700 100%)'
    baseStyle.color = '#fff'
    baseStyle.border = '2px solid #ffd700'
  }
  
  if (plate.features.isElectric) {
    baseStyle.background = 'linear-gradient(135deg, #4caf50 0%, #2196f3 100%)'
    baseStyle.color = '#fff'
  }
  
  if (plate.type === 'diplomat') {
    baseStyle.background = 'linear-gradient(135deg, #9c27b0 0%, #ff9800 100%)'
    baseStyle.color = '#fff'
  }
  
  return baseStyle
}

// ==================== MAIN COMPONENT ====================
export default function LicenseGenerator() {
  const [options, setOptions] = useState<LicenseOptions>({
    country: 'us',
    type: 'standard',
    vehicle: 'car',
    year: 2024,
    personalized: '',
    pattern: '',
    includeFlag: true,
    includeYear: false,
    includeRegion: true,
    count: 1,
    format: 'standard'
  })
  const [plates, setPlates] = useState<LicensePlate[]>([])
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<LicensePlate[]>([])
  const [favorites, setFavorites] = useState<LicensePlate[]>([])
  const [showDetails, setShowDetails] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('licenseHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('licenseFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newPlates = generateMultiplePlates(options)
    setPlates(newPlates)
    setCopied(false)
    
    // Update history (only first one) using functional update
    if (newPlates.length > 0) {
      setHistory(prev => {
        const newHistory = [newPlates[0], ...prev.slice(0, 9)]
        localStorage.setItem('licenseHistory', JSON.stringify(newHistory))
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
    const text = plates.map(p => p.formatted).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = (plate: LicensePlate) => {
    if (favorites.some(f => f.plate === plate.plate)) {
      const newFavorites = favorites.filter(f => f.plate !== plate.plate)
      setFavorites(newFavorites)
      localStorage.setItem('licenseFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [plate, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('licenseFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof LicenseOptions>(key: K, value: LicenseOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const CountryIcon = COUNTRIES[options.country].flag ? Flag : Globe

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
            License Plate Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate realistic license plates from around the world
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
            <span className="text-xs text-amber-400">{COUNTRIES[options.country].name} · {options.type}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* License Plates Grid */}
        <div className="space-y-3">
          {plates.map((plate, index) => {
            const plateStyle = getPlateStyle(plate)
            return (
              <div key={index} className="group relative">
                <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                  {/* Plate Display */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {options.includeFlag && (
                        <span className="text-2xl">{COUNTRIES[plate.country].flag}</span>
                      )}
                      <div
                        style={plateStyle}
                        className="text-xl font-bold px-6 py-3 shadow-lg"
                      >
                        {plate.formatted}
                      </div>
                    </div>
                    
                    {/* Details */}
                    {showDetails && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Country:</span>{' '}
                          <span className="text-gray-300">{COUNTRIES[plate.country].name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Region:</span>{' '}
                          <span className="text-gray-300">{plate.region}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>{' '}
                          <span className="text-gray-300 capitalize">{plate.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Year:</span>{' '}
                          <span className="text-gray-300">{plate.year}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Expires:</span>{' '}
                          <span className="text-gray-300">
                            {plate.expires?.toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vehicle:</span>{' '}
                          <span className="text-gray-300 capitalize">{plate.vehicle}</span>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {plate.features.isElectric && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                          Electric
                        </span>
                      )}
                      {plate.features.isVeteran && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                          Veteran
                        </span>
                      )}
                      {plate.type === 'diplomat' && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          Diplomatic
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => copyToClipboard(plate.formatted)}
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition opacity-0 group-hover:opacity-100"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(plate)}
                      className={`p-2 rounded-lg transition opacity-0 group-hover:opacity-100 ${
                        favorites.some(f => f.plate === plate.plate)
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      title="Add to favorites"
                    >
                      <Star size={16} fill={favorites.some(f => f.plate === plate.plate) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bulk Actions */}
        {plates.length > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm flex items-center gap-1"
            >
              <Filter size={14} />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={generate}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Regenerate All
            </button>
            <button
              onClick={copyAllToClipboard}
              className="px-3 py-1 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition text-sm flex items-center gap-1"
            >
              <Copy size={14} />
              Copy All
            </button>
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
        {/* Country Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Country / Region</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {(Object.keys(COUNTRIES) as LicenseCountry[]).map((country) => (
              <button
                key={country}
                onClick={() => updateOption('country', country)}
                className={`p-2 rounded-lg flex items-center gap-2 transition ${
                  options.country === country
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                }`}
              >
                <span className="text-lg">{COUNTRIES[country].flag}</span>
                <span className={`text-xs ${options.country === country ? 'text-amber-400' : 'text-gray-300'}`}>
                  {COUNTRIES[country].name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plate Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">License Type</label>
            <select
              value={options.type}
              onChange={(e) => updateOption('type', e.target.value as LicenseType)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              {(Object.keys(LICENSE_TYPES) as LicenseType[]).map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
            <select
              value={options.vehicle}
              onChange={(e) => updateOption('vehicle', e.target.value as VehicleType)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              {(Object.keys(VEHICLE_TYPES) as VehicleType[]).map(vehicle => (
                <option key={vehicle} value={vehicle}>{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Year of Issue</label>
            <select
              value={options.year}
              onChange={(e) => updateOption('year', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Personalized Plate */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Personalized Plate (optional)
          </label>
          <input
            type="text"
            value={options.personalized}
            onChange={(e) => updateOption('personalized', e.target.value.toUpperCase())}
            placeholder="Enter custom plate (e.g., CUSTOM1)"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono uppercase focus:outline-none focus:border-amber-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for random generation
          </p>
        </div>

        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Plates</label>
            <input
              type="number"
              min={1}
              max={10}
              value={options.count}
              onChange={(e) => updateOption('count', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {options.country === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Pattern</label>
              <input
                type="text"
                value={options.pattern}
                onChange={(e) => updateOption('pattern', e.target.value)}
                placeholder="e.g., ABC 123"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use A for letters, 1 for numbers
              </p>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={options.includeFlag}
              onChange={(e) => updateOption('includeFlag', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Show country flag</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={options.includeRegion}
              onChange={(e) => updateOption('includeRegion', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Show region</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={options.includeYear}
              onChange={(e) => updateOption('includeYear', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Show year</span>
          </label>
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
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{COUNTRIES[item.country].flag}</span>
                    <div>
                      <div className="text-sm font-mono">{item.formatted}</div>
                      <div className="text-xs text-gray-500">
                        {item.region} · {item.year}
                      </div>
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
              Favorite Plates
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{COUNTRIES[item.country].flag}</span>
                    <div>
                      <div className="text-sm font-mono">{item.formatted}</div>
                      <div className="text-xs text-gray-500">
                        {item.region} · {item.year}
                      </div>
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
          <div className="text-xs text-gray-500">Plates Generated</div>
          <div className="text-xl font-bold text-white">{history.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Favorites</div>
          <div className="text-xl font-bold text-white">{favorites.length}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Countries</div>
          <div className="text-xl font-bold text-white">
            {new Set(history.map(h => h.country)).size}
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500">Personalized</div>
          <div className="text-xl font-bold text-white">
            {history.filter(h => h.features.isPersonalized).length}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl p-4 border border-amber-500/30">
        <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
          <Car size={14} />
          License Plate Formats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
          <div>🇺🇸 US: ABC 1234</div>
          <div>🇬🇧 UK: AB12 CDE</div>
          <div>🇪🇺 EU: AB-123-CD</div>
          <div>🇯🇵 JP: 12-34</div>
          <div>🇨🇳 CN: 京A 12345</div>
          <div>🇧🇷 BR: ABC1D23</div>
          <div>🇷🇺 RU: А123ВС 777</div>
          <div>🇦🇺 AU: ABC-123</div>
        </div>
      </div>
    </div>
  )
}

// Missing Bus icon
function Bus(props: any) {
  return <Car {...props} />
}