import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, CreditCard, 
  Shield, Calendar, Lock, Fingerprint, Globe, Wallet,
  AlertCircle, CheckCircle, DollarSign, Euro, PoundSterling,
  JapaneseYen, Smartphone, Clock, Award
} from 'lucide-react'

// ==================== TYPES ====================
type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay' | 'diners' | 'maestro'
type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay' | 'diners' | 'maestro'
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY'

interface CardDetails {
  number: string
  formatted: string
  cvv: string
  expiry: string
  expiryMonth: string
  expiryYear: string
  type: CardType
  network: CardNetwork
  issuer: string
  country: string
  currency: Currency
  valid: boolean
  luhnValid: boolean
  bin: string
  lastFour: string
  masked: string
}

interface CardOptions {
  type: CardType
  count: number
  includeCvv: boolean
  includeExpiry: boolean
  expiryYears: number
  format: 'none' | 'spaces' | 'dashes' | 'groups'
  currency: Currency
  generateMultiple: boolean
}

// ==================== CONSTANTS ====================
const CARD_BINS: Record<CardType, string[]> = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55', '2221', '2720'],
  amex: ['34', '37'],
  discover: ['6011', '644', '645', '646', '647', '648', '649', '65'],
  jcb: ['3528', '3529', '3530', '3531', '3532', '3533', '3534', '3535', '3536', '3537'],
  unionpay: ['62'],
  diners: ['300', '301', '302', '303', '304', '305', '36', '38', '39'],
  maestro: ['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763']
}

const CARD_ISSUERS: Record<CardType, string[]> = {
  visa: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One', 'US Bank', 'PNC', 'TD Bank'],
  mastercard: ['Chase', 'Bank of America', 'Citi', 'Capital One', 'Wells Fargo', 'US Bank', 'Barclays'],
  amex: ['American Express'],
  discover: ['Discover Bank'],
  jcb: ['JCB Co., Ltd.'],
  unionpay: ['China UnionPay'],
  diners: ['Diners Club International'],
  maestro: ['Mastercard', 'HSBC', 'Barclays', 'Lloyds']
}

const CARD_COUNTRIES = [
  'USA', 'UK', 'Canada', 'Japan', 'Germany', 'France', 'Australia', 
  'China', 'Brazil', 'India', 'Italy', 'Spain', 'Netherlands', 'Switzerland'
]

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', 
  EUR: '€', 
  GBP: '£', 
  JPY: '¥', 
  CAD: 'C$', 
  AUD: 'A$', 
  CHF: 'Fr', 
  CNY: '¥'
}

const CARD_LENGTHS: Record<CardType, number> = {
  visa: 16,
  mastercard: 16,
  amex: 15,
  discover: 16,
  jcb: 16,
  unionpay: 16,
  diners: 14,
  maestro: 16
}

const CVV_LENGTHS: Record<CardType, number> = {
  visa: 3,
  mastercard: 3,
  amex: 4,
  discover: 3,
  jcb: 3,
  unionpay: 3,
  diners: 3,
  maestro: 3
}

// ==================== UTILITY FUNCTIONS ====================
function generateCreditCard(options: CardOptions): CardDetails {
  const bin = CARD_BINS[options.type][Math.floor(Math.random() * CARD_BINS[options.type].length)]
  const cardLength = CARD_LENGTHS[options.type]
  
  // Generate card number
  let number = bin
  while (number.length < cardLength - 1) {
    number += Math.floor(Math.random() * 10).toString()
  }
  
  // Calculate Luhn check digit
  const checkDigit = calculateLuhnCheckDigit(number)
  number += checkDigit
  
  // Format card number
  const formatted = formatCardNumber(number, options.type, options.format)
  
  // Generate CVV
  const cvvLength = CVV_LENGTHS[options.type]
  let cvv = ''
  for (let i = 0; i < cvvLength; i++) {
    cvv += Math.floor(Math.random() * 10).toString()
  }
  
  // Generate expiry
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  
  const expiryYear = currentYear + Math.floor(Math.random() * options.expiryYears) + 1
  const expiryMonth = Math.floor(Math.random() * 12) + 1
  
  const expiryMonthStr = expiryMonth.toString().padStart(2, '0')
  const expiryYearStr = expiryYear.toString().slice(-2)
  const expiry = `${expiryMonthStr}/${expiryYearStr}`
  
  // Get random issuer and country
  const issuers = CARD_ISSUERS[options.type]
  const issuer = issuers[Math.floor(Math.random() * issuers.length)]
  const country = CARD_COUNTRIES[Math.floor(Math.random() * CARD_COUNTRIES.length)]
  
  // Calculate masked version
  const masked = number.replace(/\d(?=\d{4})/g, '•')
  
  const lastFour = number.slice(-4)
  
  return {
    number,
    formatted,
    cvv,
    expiry,
    expiryMonth: expiryMonthStr,
    expiryYear: expiryYear.toString(),
    type: options.type,
    network: options.type,
    issuer,
    country,
    currency: options.currency,
    valid: true,
    luhnValid: true,
    bin,
    lastFour,
    masked
  }
}

function calculateLuhnCheckDigit(number: string): string {
  let sum = 0
  let alternate = false
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i))
    
    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    alternate = !alternate
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit.toString()
}

function formatCardNumber(number: string, type: CardType, format: string): string {
  if (format === 'none') return number
  
  const groups = []
  
  if (type === 'amex') {
    // Amex format: 4-6-5
    groups.push(number.slice(0, 4))
    groups.push(number.slice(4, 10))
    groups.push(number.slice(10, 15))
  } else if (type === 'diners') {
    // Diners format: 4-6-4
    groups.push(number.slice(0, 4))
    groups.push(number.slice(4, 10))
    groups.push(number.slice(10, 14))
  } else {
    // Default: 4-4-4-4
    for (let i = 0; i < number.length; i += 4) {
      groups.push(number.slice(i, i + 4))
    }
  }
  
  if (format === 'spaces') return groups.join(' ')
  if (format === 'dashes') return groups.join('-')
  return groups.join(' ')
}

function validateLuhn(number: string): boolean {
  let sum = 0
  let alternate = false
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i))
    
    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    alternate = !alternate
  }
  
  return sum % 10 === 0
}

function detectCardType(number: string): CardType | 'unknown' {
  for (const [type, bins] of Object.entries(CARD_BINS)) {
    for (const bin of bins) {
      if (number.startsWith(bin)) {
        return type as CardType
      }
    }
  }
  return 'unknown'
}

// ==================== MAIN COMPONENT ====================
export default function CreditCardGenerator() {
  const [options, setOptions] = useState<CardOptions>({
    type: 'visa',
    count: 1,
    includeCvv: true,
    includeExpiry: true,
    expiryYears: 5,
    format: 'groups',
    currency: 'USD',
    generateMultiple: false
  })
  const [cards, setCards] = useState<CardDetails[]>([])
  const [currentCard, setCurrentCard] = useState<CardDetails | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<CardDetails[]>([])
  const [favorites, setFavorites] = useState<CardDetails[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('cardHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('cardFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    if (options.generateMultiple) {
      const newCards = []
      for (let i = 0; i < options.count; i++) {
        newCards.push(generateCreditCard(options))
      }
      setCards(newCards)
      setCurrentCard(newCards[0])
    } else {
      const newCard = generateCreditCard(options)
      setCards([newCard])
      setCurrentCard(newCard)
    }
    setCopied(false)
    setValidationResult(null)
  }, [options])

  useEffect(() => {
    generate()
  }, [generate])

  const copyToClipboard = async (text?: string) => {
    const copyText = text || currentCard?.formatted || ''
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAllToClipboard = async () => {
    const text = cards.map(c => `${c.formatted}\nCVV: ${c.cvv}\nExp: ${c.expiry}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    if (!currentCard) return
    
    if (favorites.some(f => f.number === currentCard.number)) {
      const newFavorites = favorites.filter(f => f.number !== currentCard.number)
      setFavorites(newFavorites)
      localStorage.setItem('cardFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [currentCard, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('cardFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof CardOptions>(key: K, value: CardOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const validateCard = (number: string) => {
    const isValid = validateLuhn(number.replace(/\s/g, ''))
    const type = detectCardType(number.replace(/\s/g, ''))
    
    if (isValid) {
      setValidationResult({ 
        valid: true, 
        message: `Valid ${type !== 'unknown' ? type : ''} card number` 
      })
    } else {
      setValidationResult({ 
        valid: false, 
        message: 'Invalid card number (failed Luhn check)' 
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Credit Card Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Generate valid test credit cards for development and testing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/30">
            <span className="text-xs text-pink-400">{options.type} · {options.currency}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {currentCard && (
          <>
            {/* Credit Card Visual */}
            <div className="relative mb-6 perspective-1000">
              <div 
                className={`relative w-full max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 
                  rounded-xl p-6 border-2 transition-all duration-500 cursor-pointer
                  ${showDetails ? 'rotate-y-180' : ''}`}
                style={{
                  borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.2)'
                }}
                onClick={() => setShowDetails(!showDetails)}
              >
                {/* Card Front */}
                <div className={`transition-opacity duration-500 ${showDetails ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-xs text-gray-400">Credit Card</div>
                      <div className="text-lg font-bold text-white">{currentCard.issuer}</div>
                    </div>
                    <CreditCard size={32} className="text-gray-400" />
                  </div>
                  
                  <div className="font-mono text-2xl tracking-wider mb-4">
                    {currentCard.formatted}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-400">Card Holder</div>
                      <div className="text-sm font-semibold">TEST USER</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Expires</div>
                      <div className="text-sm font-semibold">{currentCard.expiry}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">CVV</div>
                      <div className="text-sm font-semibold">{currentCard.cvv}</div>
                    </div>
                  </div>
                </div>
                
                {/* Card Back */}
                <div className={`absolute inset-0 p-6 transition-opacity duration-500 
                  ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="h-8 bg-black -mx-6 mb-4"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Card Details</div>
                      <div className="text-sm font-bold text-white">{currentCard.network.toUpperCase()}</div>
                    </div>
                    <Lock size={24} className="text-green-400" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">BIN:</span>
                      <span className="font-mono">{currentCard.bin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Four:</span>
                      <span className="font-mono">{currentCard.lastFour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country:</span>
                      <span>{currentCard.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currency:</span>
                      <span>{currentCard.currency} {CURRENCY_SYMBOLS[currentCard.currency]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Luhn Valid:</span>
                      <span className="text-green-400">✓ Yes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-2">
                Click card to flip • Test data only
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center mb-6">
              <button 
                onClick={generate}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
                title="Generate new"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button 
                onClick={() => copyToClipboard(currentCard.formatted)}
                className="p-3 bg-pink-500 text-black rounded-lg hover:bg-pink-400 transition"
                title="Copy card number"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
              <button 
                onClick={() => copyToClipboard(`${currentCard.cvv}`)}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                title="Copy CVV"
              >
                <Fingerprint size={20} />
              </button>
              <button 
                onClick={() => copyToClipboard(currentCard.expiry)}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                title="Copy expiry"
              >
                <Calendar size={20} />
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-3 rounded-lg transition ${
                  favorites.some(f => f.number === currentCard.number)
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={favorites.some(f => f.number === currentCard.number) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={20} fill={favorites.some(f => f.number === currentCard.number) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Card Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Card Number</div>
                <div className="text-sm font-mono">{currentCard.formatted}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">CVV</div>
                <div className="text-sm font-mono">{currentCard.cvv}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Expiry</div>
                <div className="text-sm font-mono">{currentCard.expiry}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Network</div>
                <div className="text-sm font-mono capitalize">{currentCard.network}</div>
              </div>
            </div>

            {/* Luhn Validation */}
            {validationResult && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                validationResult.valid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
              }`}>
                {validationResult.valid ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <AlertCircle size={16} className="text-red-400" />
                )}
                <span className={`text-sm ${validationResult.valid ? 'text-green-400' : 'text-red-400'}`}>
                  {validationResult.message}
                </span>
              </div>
            )}

            {/* Manual Validation */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter card number to validate"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 font-mono"
                onChange={(e) => validateCard(e.target.value)}
              />
              <button
                onClick={() => validateCard(currentCard.number)}
                className="px-4 py-2 bg-pink-500 text-black rounded-lg hover:bg-pink-400 transition font-medium"
              >
                Validate
              </button>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Card Type Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Card Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { type: 'visa', label: 'Visa', icon: CreditCard },
              { type: 'mastercard', label: 'Mastercard', icon: CreditCard },
              { type: 'amex', label: 'Amex', icon: CreditCard },
              { type: 'discover', label: 'Discover', icon: CreditCard },
              { type: 'jcb', label: 'JCB', icon: CreditCard },
              { type: 'unionpay', label: 'UnionPay', icon: CreditCard },
              { type: 'diners', label: 'Diners', icon: CreditCard },
              { type: 'maestro', label: 'Maestro', icon: CreditCard },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => updateOption('type', type as CardType)}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  options.type === type
                    ? 'bg-pink-500/20 border-2 border-pink-500 text-pink-400'
                    : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Count Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Cards
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={options.count}
              onChange={(e) => updateOption('count', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Expiry Years */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Years
            </label>
            <select
              value={options.expiryYears}
              onChange={(e) => updateOption('expiryYears', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(y => (
                <option key={y} value={y}>{y} years</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={options.currency}
              onChange={(e) => updateOption('currency', e.target.value as Currency)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
            >
              {(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'] as Currency[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Format Options */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Display Format</h3>
          <div className="flex gap-2">
            {['none', 'spaces', 'dashes', 'groups'].map((format) => (
              <button
                key={format}
                onClick={() => updateOption('format', format as any)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  options.format === format
                    ? 'bg-pink-500 text-black font-medium'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input 
              type="checkbox" 
              checked={options.includeCvv}
              onChange={(e) => updateOption('includeCvv', e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Include CVV</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input 
              type="checkbox" 
              checked={options.includeExpiry}
              onChange={(e) => updateOption('includeExpiry', e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Include Expiry</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input 
              type="checkbox" 
              checked={options.generateMultiple}
              onChange={(e) => updateOption('generateMultiple', e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Generate Multiple</span>
          </label>
        </div>

        {/* Batch Actions */}
        {options.generateMultiple && cards.length > 1 && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-300">Generated Cards ({cards.length})</h3>
              <button
                onClick={copyAllToClipboard}
                className="px-3 py-1 bg-pink-500 text-black rounded-lg text-sm hover:bg-pink-400 transition"
              >
                Copy All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {cards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentCard(card)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    currentCard?.number === card.number
                      ? 'bg-pink-500/20 border-pink-500'
                      : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-mono text-sm">{card.formatted}</div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{card.expiry}</span>
                    <span>CVV: {card.cvv}</span>
                  </div>
                </div>
              ))}
            </div>
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
              {history.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="font-mono text-sm">{card.formatted}</div>
                    <div className="text-xs text-gray-500">{card.expiry} · CVV: {card.cvv}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(card.formatted)}
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
              Favorite Cards
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="font-mono text-sm">{card.formatted}</div>
                    <div className="text-xs text-gray-500">{card.expiry} · CVV: {card.cvv}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(card.formatted)}
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
          <Award size={14} />
          Card Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-gray-500">Cards Generated</div>
            <div className="text-lg font-bold text-white">{history.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Favorite Cards</div>
            <div className="text-lg font-bold text-white">{favorites.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Card Types</div>
            <div className="text-lg font-bold text-white">
              {new Set(history.map(c => c.type)).size}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Networks</div>
            <div className="text-lg font-bold text-white">
              {new Set(history.map(c => c.network)).size}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Countries</div>
            <div className="text-lg font-bold text-white">
              {new Set(history.map(c => c.country)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-800 pt-4">
        <AlertCircle size={12} className="inline mr-1" />
        These are test credit card numbers for development purposes only. They are not real credit cards and cannot be used for actual transactions.
      </div>
    </div>
  )
}