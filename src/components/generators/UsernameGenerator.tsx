import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, Sparkles,
  Gamepad2, Palette, Briefcase, Heart, Rocket, Users,
  Globe, Hash, Disc, Camera, Music, User, Award
} from 'lucide-react'

// ==================== TYPES ====================
type UsernameStyle = 'normal' | 'camel' | 'snake' | 'dot' | 'dash' | 'leet'
type UsernameTheme = 'gamer' | 'creative' | 'professional' | 'social' | 'random' | 'business' | 'startup' | 'anime' | 'tech' | 'luxury'

// ==================== CONSTANTS ====================
const USERNAME_THEMES: Record<UsernameTheme, string[]> = {
  gamer: [
    'Shadow', 'Ninja', 'Pro', 'Master', 'Elite', 'Legend', 'Ghost', 'Hunter', 'Warrior', 'Knight',
    'Sniper', 'Assassin', 'Wizard', 'Dragon', 'Phoenix', 'Viper', 'Raven', 'Wolf', 'Falcon', 'Tiger',
    'Slayer', 'Beast', 'Chaos', 'Fury', 'Rage', 'Storm', 'Thunder', 'Lightning', 'Blaze', 'Frost',
    'Dark', 'Night', 'Shadow', 'Phantom', 'Spectre', 'Reaper', 'Venom', 'Cyber', 'Neon', 'Pixel'
  ],
  creative: [
    'Pixel', 'Neon', 'Cosmic', 'Dream', 'Magic', 'Mystic', 'Phoenix', 'Nova', 'Echo', 'Aurora',
    'Crystal', 'Velvet', 'Quantum', 'Prism', 'Spectrum', 'Canvas', 'Brush', 'Palette', 'Sketch', 'Doodle',
    'Abstract', 'Vision', 'Illusion', 'Fantasy', 'Mythic', 'Legend', 'Fable', 'Story', 'Verse', 'Rhyme',
    'Melody', 'Harmony', 'Symphony', 'Rhythm', 'Beat', 'Wave', 'Flow', 'Stream', 'River', 'Ocean'
  ],
  professional: [
    'Dev', 'Tech', 'Code', 'Cloud', 'Data', 'Cyber', 'Net', 'Byte', 'Logic', 'Alpha',
    'Prime', 'Core', 'Swift', 'Smart', 'Expert', 'Pro', 'Master', 'Lead', 'Chief', 'Head',
    'Director', 'Manager', 'Executive', 'Partner', 'Principal', 'Strategist', 'Advisor', 'Consultant',
    'Specialist', 'Analyst', 'Architect', 'Engineer', 'Developer', 'Programmer', 'Coder', 'Hacker'
  ],
  social: [
    'Star', 'Heart', 'Smile', 'Sunny', 'Happy', 'Cool', 'Sweet', 'Kind', 'Bright', 'Swift',
    'Chill', 'Vibe', 'Wave', 'Flow', 'Glow', 'Spark', 'Shine', 'Bloom', 'Cherry', 'Sunshine',
    'Rainbow', 'Cloud', 'Sky', 'Ocean', 'Beach', 'Summer', 'Spring', 'Autumn', 'Winter', 'Forest',
    'Mountain', 'River', 'Lake', 'Flower', 'Rose', 'Lily', 'Daisy', 'Iris', 'Luna', 'Stella'
  ],
  random: [
    'Fluffy', 'Sneaky', 'Wild', 'Crazy', 'Silent', 'Rapid', 'Turbo', 'Hyper', 'Ultra', 'Mega',
    'Super', 'Epic', 'Awesome', 'Fantastic', 'Incredible', 'Amazing', 'Spectacular', 'Magnificent',
    'Glorious', 'Splendid', 'Marvelous', 'Wondrous', 'Mysterious', 'Enigmatic', 'Cryptic', 'Obscure'
  ],
  business: [
    'CEO', 'Founder', 'Leader', 'Chief', 'Head', 'Director', 'Manager', 'Executive', 'Partner', 'Principal',
    'Strategist', 'Advisor', 'Consultant', 'Specialist', 'Analyst', 'Investor', 'Entrepreneur', 'Innovator',
    'Visionary', 'Pioneer', 'Trailblazer', 'GameChanger', 'Disruptor', 'Mogul', 'Tycoon', 'Magnate'
  ],
  startup: [
    'Hacker', 'Growth', 'Scale', 'Launch', 'Build', 'Create', 'Innovate', 'Disrupt', 'Founder', 'Maker',
    'Builder', 'Creator', 'Developer', 'Engineer', 'Designer', 'Product', 'Platform', 'Solution', 'Service',
    'Startup', 'Venture', 'Angel', 'Seed', 'Series', 'Unicorn', 'Decacorn', 'Hectocorn'
  ],
  anime: [
    'Sakura', 'Naruto', 'Sasuke', 'Goku', 'Vegeta', 'Luffy', 'Zoro', 'Ichigo', 'Rukia', 'Eren',
    'Levi', 'Mikasa', 'Light', 'L', 'Near', 'Mello', 'Gon', 'Killua', 'Kurapika', 'Hisoka',
    'Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Kirito', 'Asuna', 'Sinon', 'Leafa', 'Yuna', 'Tidus'
  ],
  tech: [
    'Byte', 'Bit', 'Kernel', 'Shell', 'Script', 'Code', 'Dev', 'API', 'SDK', 'JSON',
    'XML', 'HTML', 'CSS', 'JS', 'TS', 'React', 'Vue', 'Angular', 'Node', 'Python',
    'Java', 'Ruby', 'PHP', 'Cpp', 'Rust', 'Go', 'Swift', 'Kotlin', 'Flutter', 'Dart'
  ],
  luxury: [
    'Royal', 'Elite', 'Prestige', 'Supreme', 'Exclusive', 'Luxury', 'Premium', 'Deluxe', 'Platinum', 'Gold',
    'Silver', 'Diamond', 'Crystal', 'Sapphire', 'Ruby', 'Emerald', 'Pearl', 'Onyx', 'Jade', 'Amber',
    'Velvet', 'Silk', 'Satin', 'Cashmere', 'Merino', 'Angora', 'Alpaca', 'Vicuña', 'Chinchilla'
  ]
}

const STYLE_ICONS = {
  normal: User,
  camel: Hash,
  snake: Disc,
  dot: Camera,
  dash: Music,
  leet: Award
}

const THEME_ICONS: Record<UsernameTheme, any> = {
  gamer: Gamepad2,
  creative: Palette,
  professional: Briefcase,
  social: Heart,
  random: Rocket,
  business: Users,
  startup: Sparkles,
  anime: Globe,
  tech: Hash,
  luxury: Award
}

const USERNAME_SUFFIXES = [
  '123', '99', 'X', 'Pro', 'YT', 'TV', 'Live', 'Hub', 'Zone', 'Life', 
  'World', 'Real', 'Official', 'HQ', 'Inc', 'LLC', 'Co', 'Corp', 'Ltd',
  'IO', 'AI', 'Cloud', 'Net', 'Tech', 'Dev', 'App', 'Web', 'Site', 'Online'
]

const USERNAME_PREFIXES = [
  'Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sir', 'Lady', 'Lord', 'The', 'Its',
  'Just', 'Real', 'Official', 'Original', 'Authentic', 'Genuine', 'True'
]

// ==================== UTILITY FUNCTIONS ====================
function generateUsername(
  theme: UsernameTheme,
  style: UsernameStyle,
  includeNumbers: boolean,
  includeSymbols: boolean,
  firstName: string = '',
  lastName: string = '',
  email: string = ''
): string {
  
  // Generate from name if provided
  if (firstName || lastName) {
    const first = firstName.toLowerCase() || 'user'
    const last = lastName.toLowerCase() || 'name'
    const randomNum = Math.floor(Math.random() * 9999)
    const separators = ['.', '_', '-', '']
    const separator = separators[Math.floor(Math.random() * separators.length)]
    
    const patterns = [
      `${first}${separator}${last}`,
      `${first}${last}`,
      `${first.charAt(0)}${last}`,
      `${first}${last.charAt(0)}`,
      `${first}${randomNum}`,
      `${last}${randomNum}`,
      `${first}${separator}${last}${randomNum}`,
    ]
    return patterns[Math.floor(Math.random() * patterns.length)]
  }
  
  // Generate from email if provided
  if (email) {
    const username = email.split('@')[0]
    if (includeNumbers) {
      return username + Math.floor(Math.random() * 9999)
    }
    return username
  }
  
  // Generate from theme
  const words = USERNAME_THEMES[theme] || USERNAME_THEMES.random
  const wordCount = Math.random() > 0.6 ? 2 : 1
  
  let result = ''
  for (let i = 0; i < wordCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)]
    result += word
  }
  
  // Add prefix (20% chance)
  if (Math.random() > 0.8) {
    const prefix = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)]
    result = prefix + result
  }
  
  // Apply leet speak if style is leet
  if (style === 'leet') {
    result = result
      .replace(/a/gi, '4')
      .replace(/e/gi, '3')
      .replace(/i/gi, '1')
      .replace(/o/gi, '0')
      .replace(/s/gi, '5')
      .replace(/t/gi, '7')
      .replace(/b/gi, '8')
      .replace(/g/gi, '9')
  }
  
  // Apply style transformations
  switch(style) {
    case 'camel':
      result = result.charAt(0).toLowerCase() + result.slice(1)
      break
    case 'snake':
      result = result.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase()
      break
    case 'dot':
      result = result.toLowerCase().replace(/([A-Z])/g, '.$1').replace(/^\./, '').toLowerCase()
      break
    case 'dash':
      result = result.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase()
      break
    default: // normal
      result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()
  }
  
  // Add numbers if enabled
  if (includeNumbers) {
    const numLength = Math.floor(Math.random() * 3) + 2 // 2-4 digits
    let num = ''
    for (let i = 0; i < numLength; i++) {
      num += Math.floor(Math.random() * 10).toString()
    }
    result += num
  }
  
  // Add suffix (30% chance)
  if (Math.random() > 0.7 && !includeNumbers) {
    const suffix = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)]
    result += suffix
  }
  
  // Add symbols if enabled
  if (includeSymbols) {
    const symbols = ['!', '@', '#', '$', '%', '&', '*', '_', '-', '.']
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    result += symbol
    if (Math.random() > 0.5) {
      result = symbol + result
    }
  }
  
  return result
}

function getUsernameScore(username: string): {
  uniqueness: number
  memorability: number
  availability: number
  overall: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let uniqueness = 70
  let memorability = 70
  let availability = 70
  
  // Check length
  if (username.length < 4) {
    uniqueness += 10
    memorability -= 20
    availability += 20
    suggestions.push('Short usernames are memorable but may be taken')
  } else if (username.length > 15) {
    uniqueness += 20
    memorability -= 30
    availability += 30
    suggestions.push('Long usernames are unique but harder to remember')
  } else {
    uniqueness += 15
    memorability += 20
    availability += 15
    suggestions.push('Good length for balance of uniqueness and memorability')
  }
  
  // Check for numbers
  if (/\d/.test(username)) {
    uniqueness += 15
    memorability -= 10
    suggestions.push('Numbers increase uniqueness but reduce memorability')
  }
  
  // Check for symbols
  if (/[!@#$%^&*]/.test(username)) {
    uniqueness += 20
    memorability -= 20
    suggestions.push('Symbols make username very unique but hard to remember')
  }
  
  // Check for mixed case
  if (/[A-Z]/.test(username) && /[a-z]/.test(username)) {
    uniqueness += 10
    memorability += 10
  }
  
  // Cap values
  uniqueness = Math.min(100, Math.max(0, uniqueness))
  memorability = Math.min(100, Math.max(0, memorability))
  availability = Math.min(100, Math.max(0, availability))
  
  const overall = Math.round((uniqueness + memorability + availability) / 3)
  
  return { uniqueness, memorability, availability, overall, suggestions }
}

// ==================== MAIN COMPONENT ====================
export default function UsernameGenerator() {
  const [theme, setTheme] = useState<UsernameTheme>('gamer')
  const [style, setStyle] = useState<UsernameStyle>('normal')
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('usernameHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('usernameFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newUsername = generateUsername(
      theme, style, includeNumbers, includeSymbols,
      firstName, lastName, email
    )
    setUsername(newUsername)
    setCopied(false)
    
    // Update history using functional update
    setHistory(prev => {
      const newHistory = [newUsername, ...prev.slice(0, 9)]
      localStorage.setItem('usernameHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }, [theme, style, includeNumbers, includeSymbols, firstName, lastName, email])

  useEffect(() => {
    generate()
  }, [theme, style, includeNumbers, includeSymbols, firstName, lastName, email])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(username)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    if (favorites.includes(username)) {
      const newFavorites = favorites.filter(f => f !== username)
      setFavorites(newFavorites)
      localStorage.setItem('usernameFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [username, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('usernameFavorites', JSON.stringify(newFavorites))
    }
  }

  const score = getUsernameScore(username)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Username Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Create unique, memorable usernames for any platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/30">
            <span className="text-xs text-purple-400">{theme} · {style}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Username Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="font-mono text-3xl bg-gray-900 p-6 rounded-lg border-2 border-gray-700 break-all min-h-[100px] flex items-center">
              {username}
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
                favorites.includes(username) 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={favorites.includes(username) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={24} fill={favorites.includes(username) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Uniqueness</div>
            <div className="text-lg font-bold text-purple-400">{score.uniqueness}%</div>
            <div className="w-full h-1 bg-gray-700 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${score.uniqueness}%` }} />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Memorability</div>
            <div className="text-lg font-bold text-pink-400">{score.memorability}%</div>
            <div className="w-full h-1 bg-gray-700 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-pink-400 rounded-full" style={{ width: `${score.memorability}%` }} />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Availability</div>
            <div className="text-lg font-bold text-green-400">{score.availability}%</div>
            <div className="w-full h-1 bg-gray-700 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${score.availability}%` }} />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Overall</div>
            <div className="text-lg font-bold text-yellow-400">{score.overall}%</div>
            <div className="w-full h-1 bg-gray-700 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${score.overall}%` }} />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {score.suggestions.length > 0 && (
          <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">💡 Suggestions</div>
            <div className="text-sm text-gray-300">
              {score.suggestions.map((s, i) => (
                <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-800 rounded-full text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(USERNAME_THEMES) as UsernameTheme[]).map((t) => {
              const Icon = THEME_ICONS[t]
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                    theme === t
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs capitalize">{t}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Style</h3>
          <div className="grid grid-cols-5 gap-2">
            {(['normal', 'camel', 'snake', 'dot', 'dash', 'leet'] as UsernameStyle[]).map((s) => {
              const Icon = STYLE_ICONS[s] || User
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                    style === s
                      ? 'bg-pink-500/20 border-2 border-pink-500 text-pink-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs capitalize">{s}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input 
              type="checkbox" 
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Include numbers</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input 
              type="checkbox" 
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-gray-300 group-hover:text-white transition">Include symbols</span>
          </label>
        </div>

        {/* Personalization */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Personalize (Optional)</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="username-firstname" className="sr-only">First name</label>
              <input
                id="username-firstname"
                name="username-firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="username-lastname" className="sr-only">Last name</label>
              <input
                id="username-lastname"
                name="username-lastname"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="username-email" className="sr-only">Email address</label>
            <input
              id="username-email"
              name="username-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
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
                {history.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                    <span className="font-mono text-sm">{name}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(name)}
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
                Favorite Usernames
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {favorites.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                    <span className="font-mono text-sm">{name}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(name)}
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