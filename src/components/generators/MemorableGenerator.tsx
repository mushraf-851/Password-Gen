import { useState, useCallback, useEffect } from 'react'
import { 
  Copy, Check, RefreshCw, Star, History, BookOpen,
  Sparkles, Heart, Globe, Hash, Music, Coffee,
  Cloud, Moon, Sun, Star as StarIcon, Feather,
  Crown, Wand2, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6
} from 'lucide-react'

// ==================== TYPES ====================
type WordLanguage = 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'latin' | 'fantasy'
type WordTheme = 'nature' | 'fantasy' | 'space' | 'ocean' | 'animals' | 'colors' | 'emotions' | 'actions' | 'objects' | 'mythology'
type SeparatorType = 'hyphen' | 'underscore' | 'dot' | 'space' | 'none' | 'random'
type Capitalization = 'lowercase' | 'uppercase' | 'title' | 'camel' | 'random'

interface MemorablePassword {
  password: string
  words: string[]
  separator: string
  capitalization: Capitalization
  numbers: string
  symbols: string
  language: WordLanguage
  theme: WordTheme
  wordCount: number
  entropy: number
  strength: SecurityLevel
  pattern: string[]
}

interface MemorableOptions {
  wordCount: number
  minWordLength: number
  maxWordLength: number
  language: WordLanguage
  theme: WordTheme
  separator: SeparatorType
  capitalization: Capitalization
  includeNumbers: boolean
  includeSymbols: boolean
  numberPosition: 'prefix' | 'suffix' | 'between' | 'random'
  symbolPosition: 'prefix' | 'suffix' | 'between' | 'random'
  customSeparator: string
  customWords: string[]
  useCustomWords: boolean
  addDigits: number
  addSymbols: number
}

type SecurityLevel = 'weak' | 'fair' | 'good' | 'strong' | 'excellent'

// ==================== CONSTANTS ====================
const WORD_LISTS: Record<WordLanguage, Record<WordTheme, string[]>> = {
  english: {
    nature: [
      'mountain', 'river', 'forest', 'ocean', 'desert', 'valley', 'canyon', 'waterfall',
      'sunset', 'sunrise', 'thunder', 'lightning', 'rainbow', 'cloud', 'storm', 'breeze',
      'flower', 'tree', 'grass', 'leaf', 'petal', 'root', 'branch', 'meadow',
      'crystal', 'stone', 'rock', 'pebble', 'sand', 'dune', 'cliff', 'peak'
    ],
    fantasy: [
      'dragon', 'phoenix', 'griffin', 'unicorn', 'wizard', 'sorcerer', 'knight', 'castle',
      'magic', 'spell', 'potion', 'wand', 'crystal', 'gem', 'treasure', 'kingdom',
      'elf', 'dwarf', 'orc', 'troll', 'giant', 'fairy', 'goblin', 'gnome',
      'sword', 'shield', 'armor', 'crown', 'throne', 'quest', 'legend', 'myth'
    ],
    space: [
      'star', 'planet', 'galaxy', 'nebula', 'comet', 'asteroid', 'meteor', 'moon',
      'sun', 'orbit', 'gravity', 'cosmos', 'universe', 'void', 'blackhole', 'quasar',
      'saturn', 'mars', 'venus', 'jupiter', 'mercury', 'neptune', 'uranus', 'pluto',
      'astronaut', 'rocket', 'spaceship', 'satellite', 'telescope', 'observatory'
    ],
    ocean: [
      'whale', 'dolphin', 'shark', 'octopus', 'jellyfish', 'seahorse', 'crab', 'lobster',
      'coral', 'reef', 'tide', 'wave', 'current', 'depth', 'abyss', 'trench',
      'pearl', 'shell', 'sand', 'seaweed', 'kelp', 'anemone', 'starfish', 'urchin',
      'lagoon', 'bay', 'harbor', 'coast', 'shore', 'beach', 'cliff', 'cove'
    ],
    animals: [
      'tiger', 'lion', 'leopard', 'cheetah', 'panther', 'jaguar', 'wolf', 'fox',
      'eagle', 'hawk', 'falcon', 'raven', 'crow', 'owl', 'parrot', 'flamingo',
      'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'gazelle', 'antelope', 'buffalo',
      'monkey', 'gorilla', 'chimpanzee', 'orangutan', 'lemur', 'sloth', 'koala', 'panda'
    ],
    colors: [
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown',
      'black', 'white', 'gray', 'silver', 'gold', 'bronze', 'copper', 'brass',
      'crimson', 'scarlet', 'vermilion', 'ruby', 'rose', 'cherry', 'blood', 'fire',
      'azure', 'cobalt', 'sapphire', 'sky', 'ocean', 'cyan', 'turquoise', 'aqua'
    ],
    emotions: [
      'happy', 'joyful', 'excited', 'peaceful', 'calm', 'serene', 'gentle', 'kind',
      'brave', 'courageous', 'fearless', 'bold', 'strong', 'mighty', 'powerful', 'epic',
      'wise', 'clever', 'smart', 'bright', 'brilliant', 'genius', 'intelligent', 'sharp',
      'loving', 'caring', 'tender', 'warm', 'sweet', 'soft', 'smooth', 'silky'
    ],
    actions: [
      'jump', 'run', 'fly', 'swim', 'dive', 'climb', 'crawl', 'slither',
      'dance', 'sing', 'laugh', 'smile', 'dream', 'imagine', 'create', 'build',
      'paint', 'draw', 'sketch', 'write', 'read', 'learn', 'study', 'teach',
      'explore', 'discover', 'wander', 'roam', 'travel', 'journey', 'quest', 'seek'
    ],
    objects: [
      'book', 'pen', 'paper', 'desk', 'chair', 'table', 'lamp', 'clock',
      'phone', 'computer', 'keyboard', 'mouse', 'screen', 'monitor', 'camera', 'lens',
      'cup', 'mug', 'glass', 'bottle', 'plate', 'bowl', 'fork', 'spoon',
      'door', 'window', 'wall', 'floor', 'ceiling', 'roof', 'stairs', 'hall'
    ],
    mythology: [
      'zeus', 'athena', 'apollo', 'artemis', 'ares', 'aphrodite', 'hermes', 'poseidon',
      'thor', 'odin', 'loki', 'freya', 'baldur', 'heimdall', 'tyr', 'frigg',
      'ra', 'isis', 'osiris', 'horus', 'anubis', 'thoth', 'bastet', 'sekmet',
      'kingarthur', 'merlin', 'lancelot', 'guinevere', 'excalibur', 'camelot', 'avalon'
    ]
  },
  spanish: {
    nature: ['montaña', 'río', 'bosque', 'océano', 'desierto', 'valle', 'cascada', 'nube'],
    fantasy: ['dragón', 'fénix', 'unicornio', 'mago', 'hechicero', 'caballero', 'castillo', 'espada'],
    space: ['estrella', 'planeta', 'galaxia', 'cometa', 'luna', 'sol', 'órbita', 'cosmos'],
    ocean: ['ballena', 'delfín', 'tiburón', 'pulpo', 'coral', 'ola', 'marea', 'playa'],
    animals: ['tigre', 'león', 'águila', 'lobo', 'elefante', 'jirafa', 'cebra', 'mono'],
    colors: ['rojo', 'azul', 'verde', 'amarillo', 'púrpura', 'naranja', 'rosa', 'marrón'],
    emotions: ['feliz', 'tranquilo', 'valiente', 'fuerte', 'sabio', 'inteligente', 'amable', 'calma'],
    actions: ['saltar', 'correr', 'volar', 'nadar', 'bailar', 'cantar', 'soñar', 'crear'],
    objects: ['libro', 'pluma', 'mesa', 'silla', 'lámpara', 'reloj', 'teléfono', 'cámara'],
    mythology: ['zeus', 'atenea', 'apolo', 'poseidón', 'thor', 'odín', 'ra', 'isis']
  },
  french: {
    nature: ['montagne', 'rivière', 'forêt', 'océan', 'désert', 'vallée', 'cascade', 'nuage'],
    fantasy: ['dragon', 'phénix', 'licorne', 'sorcier', 'chevalier', 'château', 'épée', 'magie'],
    space: ['étoile', 'planète', 'galaxie', 'comète', 'lune', 'soleil', 'orbite', 'cosmos'],
    ocean: ['baleine', 'dauphin', 'requin', 'pieuvre', 'corail', 'vague', 'marée', 'plage'],
    animals: ['tigre', 'lion', 'aigle', 'loup', 'éléphant', 'girafe', 'zèbre', 'singe'],
    colors: ['rouge', 'bleu', 'vert', 'jaune', 'violet', 'orange', 'rose', 'marron'],
    emotions: ['heureux', 'calme', 'courageux', 'fort', 'sage', 'intelligent', 'gentil', 'doux'],
    actions: ['sauter', 'courir', 'voler', 'nager', 'danser', 'chanter', 'rêver', 'créer'],
    objects: ['livre', 'stylo', 'table', 'chaise', 'lampe', 'horloge', 'téléphone', 'caméra'],
    mythology: ['zeus', 'athéna', 'apollon', 'poséidon', 'thor', 'odin', 'ra', 'isis']
  },
  german: {
    nature: ['berg', 'fluss', 'wald', 'ozean', 'wüste', 'tal', 'wasserfall', 'wolke'],
    fantasy: ['drache', 'phönix', 'einhorn', 'zauberer', 'ritter', 'schloss', 'schwert', 'magie'],
    space: ['stern', 'planet', 'galaxie', 'komet', 'mond', 'sonne', 'orbit', 'kosmos'],
    ocean: ['wal', 'delfin', 'hai', 'krake', 'koralle', 'welle', 'gezeiten', 'strand'],
    animals: ['tiger', 'löwe', 'adler', 'wolf', 'elefant', 'giraffe', 'zebra', 'affe'],
    colors: ['rot', 'blau', 'grün', 'gelb', 'lila', 'orange', 'pink', 'braun'],
    emotions: ['glücklich', 'ruhig', 'mutig', 'stark', 'weise', 'intelligent', 'freundlich', 'sanft'],
    actions: ['springen', 'laufen', 'fliegen', 'schwimmen', 'tanzen', 'singen', 'träumen', 'schaffen'],
    objects: ['buch', 'stift', 'tisch', 'stuhl', 'lampe', 'uhr', 'telefon', 'kamera'],
    mythology: ['zeus', 'athene', 'apollon', 'poseidon', 'thor', 'odin', 'ra', 'isis']
  },
  italian: {
    nature: ['montagna', 'fiume', 'foresta', 'oceano', 'deserto', 'valle', 'cascata', 'nuvola'],
    fantasy: ['drago', 'fenice', 'unicorno', 'mago', 'cavaliere', 'castello', 'spada', 'magia'],
    space: ['stella', 'pianeta', 'galassia', 'cometa', 'luna', 'sole', 'orbita', 'cosmo'],
    ocean: ['balena', 'delfino', 'squalo', 'polpo', 'corallo', 'onda', 'marea', 'spiaggia'],
    animals: ['tigre', 'leone', 'aquila', 'lupo', 'elefante', 'giraffa', 'zebra', 'scimmia'],
    colors: ['rosso', 'blu', 'verde', 'giallo', 'viola', 'arancione', 'rosa', 'marrone'],
    emotions: ['felice', 'calmo', 'coraggioso', 'forte', 'saggio', 'intelligente', 'gentile', 'dolce'],
    actions: ['saltare', 'correre', 'volare', 'nuotare', 'ballare', 'cantare', 'sognare', 'creare'],
    objects: ['libro', 'penna', 'tavolo', 'sedia', 'lampada', 'orologio', 'telefono', 'fotocamera'],
    mythology: ['zeus', 'atena', 'apollo', 'poseidone', 'thor', 'odino', 'ra', 'isi']
  },
  latin: {
    nature: ['mons', 'flumen', 'silva', 'oceanus', 'desertum', 'vallis', 'cataracta', 'nubes'],
    fantasy: ['draco', 'phoenix', 'unicornis', 'magus', 'eques', 'castellum', 'gladius', 'magia'],
    space: ['stella', 'planeta', 'galaxia', 'cometes', 'luna', 'sol', 'orbita', 'cosmos'],
    ocean: ['cetus', 'delphinus', 'pistris', 'octopus', 'corallium', 'unda', 'aestus', 'litus'],
    animals: ['tigris', 'leo', 'aquila', 'lupus', 'elephantus', 'giraffa', 'zebra', 'simius'],
    colors: ['ruber', 'caeruleus', 'viridis', 'flavus', 'purpureus', 'aurantiacus', 'roseus', 'brunneus'],
    emotions: ['felix', 'tranquillus', 'fortis', 'potens', 'sapiens', 'intellegens', 'benignus', 'mollis'],
    actions: ['salire', 'currere', 'volare', 'natare', 'saltare', 'cantare', 'somnare', 'creare'],
    objects: ['liber', 'penna', 'mensa', 'sella', 'lucerna', 'horologium', 'telephonum', 'camera'],
    mythology: ['zeus', 'athena', 'apollo', 'poseidon', 'thor', 'odinus', 'ra', 'isis']
  },
  fantasy: {
    nature: ['eldath', 'silvanus', 'mielikki', 'chauntea', 'grove', 'thicket', 'glade', 'bramble'],
    fantasy: ['mystra', 'azuth', 'savras', 'orem', 'candlekeep', 'waterdeep', 'neverwinter', 'baldur'],
    space: ['celestian', 'selune', 'surya', 'shar', 'astral', 'ethereal', 'shadowfell', 'feywild'],
    ocean: ['umberlee', 'deep', 'sahuagin', 'merfolk', 'krakentua', 'leviathan', 'sea', 'tide'],
    animals: ['displacer', 'owlbear', 'bulette', 'rust', 'gelatinous', 'mimic', 'beholder', 'illithid'],
    colors: ['mithral', 'adamantine', 'cold', 'fire', 'acid', 'lightning', 'thunder', 'necrotic'],
    emotions: ['chaotic', 'lawful', 'neutral', 'good', 'evil', 'brave', 'fearless', 'honorable'],
    actions: ['teleport', 'enchant', 'summon', 'banish', 'polymorph', 'shapechange', 'wildshape', 'metamorph'],
    objects: ['wand', 'staff', 'rod', 'crystal', 'orb', 'gem', 'artifact', 'relic'],
    mythology: ['corellon', 'gruumsh', 'moradin', 'yondalla', 'garl', 'tiamat', 'bahamut', 'lolth']
  }
}

const SEPARATORS: Record<SeparatorType, string> = {
  hyphen: '-',
  underscore: '_',
  dot: '.',
  space: ' ',
  none: '',
  random: ''
}

const CAPITALIZATION_STYLES: Record<Capitalization, string> = {
  lowercase: 'all lowercase',
  uppercase: 'ALL UPPERCASE',
  title: 'Title Case',
  camel: 'camelCase',
  random: 'RaNdOm CaSe'
}

const SECURITY_LEVELS: Record<SecurityLevel, { color: string; icon: any; description: string }> = {
  weak: { color: '#ef4444', icon: Dice1, description: 'Easy to guess' },
  fair: { color: '#f59e0b', icon: Dice2, description: 'Could be stronger' },
  good: { color: '#3b82f6', icon: Dice3, description: 'Good for everyday use' },
  strong: { color: '#10b981', icon: Dice4, description: 'Secure for most purposes' },
  excellent: { color: '#8b5cf6', icon: Dice6, description: 'Maximum security' }
}

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

// ==================== UTILITY FUNCTIONS ====================
function getRandomWords(
  count: number,
  language: WordLanguage,
  theme: WordTheme,
  minLength: number,
  maxLength: number
): string[] {
  const wordList = WORD_LISTS[language]?.[theme] || WORD_LISTS.english.nature
  const words: string[] = []
  
  for (let i = 0; i < count; i++) {
    let word = wordList[Math.floor(Math.random() * wordList.length)]
    
    // Filter by length if needed
    while (word.length < minLength || word.length > maxLength) {
      word = wordList[Math.floor(Math.random() * wordList.length)]
    }
    
    words.push(word)
  }
  
  return words
}

function applyCapitalization(word: string, style: Capitalization, index: number): string {
  switch (style) {
    case 'lowercase':
      return word.toLowerCase()
    case 'uppercase':
      return word.toUpperCase()
    case 'title':
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    case 'camel':
      return index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    case 'random':
      return word.split('').map(char => 
        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
      ).join('')
    default:
      return word
  }
}

function generateMemorablePassword(options: MemorableOptions): MemorablePassword {
  // Get words
  const words = options.useCustomWords && options.customWords.length > 0
    ? options.customWords.slice(0, options.wordCount)
    : getRandomWords(
        options.wordCount,
        options.language,
        options.theme,
        options.minWordLength,
        options.maxWordLength
      )
  
  // Apply capitalization
  const capitalizedWords = words.map((word, i) => 
    applyCapitalization(word, options.capitalization, i)
  )
  
  // Determine separator
  let separator = SEPARATORS[options.separator]
  if (options.separator === 'random') {
    const separators = Object.values(SEPARATORS).filter(s => s !== '')
    separator = separators[Math.floor(Math.random() * separators.length)]
  }
  if (options.customSeparator) separator = options.customSeparator
  
  // Generate numbers
  let numbers = ''
  if (options.includeNumbers) {
    const digits = options.addDigits || Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < digits; i++) {
      numbers += Math.floor(Math.random() * 10).toString()
    }
  }
  
  // Generate symbols
  let symbols = ''
  if (options.includeSymbols) {
    const symCount = options.addSymbols || Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < symCount; i++) {
      symbols += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    }
  }
  
  // Build password
  let password = capitalizedWords.join(separator)
  const pattern: string[] = []
  
  // Add numbers at position
  if (numbers) {
    switch (options.numberPosition) {
      case 'prefix':
        password = numbers + separator + password
        pattern.unshift('numbers')
        break
      case 'suffix':
        password = password + separator + numbers
        pattern.push('numbers')
        break
      case 'between':
        const parts = password.split(separator)
        const insertPos = Math.floor(parts.length / 2)
        parts.splice(insertPos, 0, numbers)
        password = parts.join(separator)
        pattern.splice(insertPos, 0, 'numbers')
        break
      case 'random':
        if (Math.random() > 0.5) {
          password = numbers + separator + password
          pattern.unshift('numbers')
        } else {
          password = password + separator + numbers
          pattern.push('numbers')
        }
        break
    }
  }
  
  // Add symbols at position
  if (symbols) {
    switch (options.symbolPosition) {
      case 'prefix':
        password = symbols + separator + password
        pattern.unshift('symbols')
        break
      case 'suffix':
        password = password + separator + symbols
        pattern.push('symbols')
        break
      case 'between':
        const parts = password.split(separator)
        const insertPos = Math.floor(parts.length / 2)
        parts.splice(insertPos, 0, symbols)
        password = parts.join(separator)
        pattern.splice(insertPos, 0, 'symbols')
        break
      case 'random':
        if (Math.random() > 0.5) {
          password = symbols + separator + password
          pattern.unshift('symbols')
        } else {
          password = password + separator + symbols
          pattern.push('symbols')
        }
        break
    }
  }
  
  // Calculate entropy
  const uniqueChars = new Set(password.split('')).size
  const entropy = Math.log2(Math.pow(uniqueChars, password.length))
  
  // Determine strength
  let strength: SecurityLevel = 'fair'
  if (entropy >= 80) strength = 'excellent'
  else if (entropy >= 60) strength = 'strong'
  else if (entropy >= 40) strength = 'good'
  else if (entropy >= 30) strength = 'fair'
  else strength = 'weak'
  
  return {
    password,
    words,
    separator,
    capitalization: options.capitalization,
    numbers,
    symbols,
    language: options.language,
    theme: options.theme,
    wordCount: options.wordCount,
    entropy,
    strength,
    pattern
  }
}

function getPasswordTips(password: MemorablePassword): string[] {
  const tips: string[] = []
  
  if (password.wordCount < 3) {
    tips.push('Add more words for better security')
  }
  
  if (password.entropy < 40) {
    tips.push('Password could be stronger - consider adding numbers or symbols')
  }
  
  if (!password.numbers) {
    tips.push('Adding numbers makes passwords harder to crack')
  }
  
  if (!password.symbols) {
    tips.push('Symbols add significant strength')
  }
  
  if (password.separator === '') {
    tips.push('Using a separator makes passwords easier to read')
  }
  
  if (password.capitalization === 'lowercase') {
    tips.push('Mixed case adds entropy')
  }
  
  if (password.words.every(w => w.length < 5)) {
    tips.push('Using longer words increases security')
  }
  
  return tips
}

// ==================== MAIN COMPONENT ====================
export default function MemorableGenerator() {
  const [options, setOptions] = useState<MemorableOptions>({
    wordCount: 4,
    minWordLength: 3,
    maxWordLength: 8,
    language: 'english',
    theme: 'nature',
    separator: 'hyphen',
    capitalization: 'title',
    includeNumbers: true,
    includeSymbols: false,
    numberPosition: 'suffix',
    symbolPosition: 'suffix',
    customSeparator: '',
    customWords: [],
    useCustomWords: false,
    addDigits: 2,
    addSymbols: 1
  })
  const [password, setPassword] = useState<MemorablePassword | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<MemorablePassword[]>([])
  const [favorites, setFavorites] = useState<MemorablePassword[]>([])
  const [customWordInput, setCustomWordInput] = useState('')
  const [showTips, setShowTips] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('memorableHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    const savedFavorites = localStorage.getItem('memorableFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const generate = useCallback(() => {
    const newPassword = generateMemorablePassword(options)
    setPassword(newPassword)
    setCopied(false)
    
    setHistory(prev => {
      const newHistory = [newPassword, ...prev.slice(0, 9)]
      localStorage.setItem('memorableHistory', JSON.stringify(newHistory))
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

  const toggleFavorite = () => {
    if (!password) return
    
    if (favorites.some(f => f.password === password.password)) {
      const newFavorites = favorites.filter(f => f.password !== password.password)
      setFavorites(newFavorites)
      localStorage.setItem('memorableFavorites', JSON.stringify(newFavorites))
    } else {
      const newFavorites = [password, ...favorites.slice(0, 9)]
      setFavorites(newFavorites)
      localStorage.setItem('memorableFavorites', JSON.stringify(newFavorites))
    }
  }

  const updateOption = <K extends keyof MemorableOptions>(key: K, value: MemorableOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const addCustomWord = () => {
    if (customWordInput.trim()) {
      const newWords = [...options.customWords, customWordInput.trim()]
      updateOption('customWords', newWords)
      setCustomWordInput('')
    }
  }

  const removeCustomWord = (index: number) => {
    const newWords = options.customWords.filter((_, i) => i !== index)
    updateOption('customWords', newWords)
  }

  const SecurityIcon = password ? SECURITY_LEVELS[password.strength].icon : Dice3

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Memorable Password Generator
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Create easy-to-remember but secure passwords
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/30">
            <span className="text-xs text-red-400">{options.language} · {options.theme}</span>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {password && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          {/* Password Display */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="font-mono text-2xl bg-gray-900 p-6 rounded-lg border-2 border-gray-700 break-all">
                {password.password}
              </div>
              
              {/* Word Breakdown */}
              <div className="mt-3 flex flex-wrap gap-2">
                {password.words.map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                    {word}
                  </span>
                ))}
                {password.numbers && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {password.numbers}
                  </span>
                )}
                {password.symbols && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {password.symbols}
                  </span>
                )}
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
                onClick={() => copyToClipboard(password.password)}
                className="p-4 bg-red-500 text-black rounded-lg hover:bg-red-400 transition"
                title="Copy to clipboard"
              >
                {copied ? <Check size={24} /> : <Copy size={24} />}
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-4 rounded-lg transition ${
                  favorites.some(f => f.password === password.password)
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Add to favorites"
              >
                <Star size={24} fill={favorites.some(f => f.password === password.password) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <SecurityIcon size={20} style={{ color: SECURITY_LEVELS[password.strength].color }} />
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(password.entropy / 80) * 100}%`,
                    backgroundColor: SECURITY_LEVELS[password.strength].color
                  }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: SECURITY_LEVELS[password.strength].color }}>
                {password.strength} ({Math.round(password.entropy)} bits)
              </span>
            </div>
          </div>

          {/* Tips */}
          {showTips && (
            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Wand2 size={14} />
                Improvement Tips
              </h4>
              <ul className="space-y-1">
                {getPasswordTips(password).map((tip, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pattern Display */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-xs text-gray-500 hover:text-gray-400 transition flex items-center gap-1"
            >
              <Wand2 size={12} />
              {showTips ? 'Hide Tips' : 'Show Tips'}
            </button>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">
              Pattern: {password.pattern.join(' → ') || 'words only'}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        {/* Word Count */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">Number of Words</label>
            <span className="text-2xl font-bold text-red-400">{options.wordCount}</span>
          </div>
          <input 
            type="range" 
            min={2} 
            max={8} 
            value={options.wordCount} 
            onChange={(e) => updateOption('wordCount', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between mt-2">
            {[2, 3, 4, 5, 6, 7, 8].map(c => (
              <button
                key={c}
                onClick={() => updateOption('wordCount', c)}
                className={`px-2 py-1 text-xs rounded ${
                  options.wordCount === c 
                    ? 'bg-red-500 text-black font-bold' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Language & Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Language</h3>
            <select
              value={options.language}
              onChange={(e) => updateOption('language', e.target.value as WordLanguage)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {(['english', 'spanish', 'french', 'german', 'italian', 'latin', 'fantasy'] as WordLanguage[]).map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Theme</h3>
            <select
              value={options.theme}
              onChange={(e) => updateOption('theme', e.target.value as WordTheme)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {(['nature', 'fantasy', 'space', 'ocean', 'animals', 'colors', 'emotions', 'actions', 'objects', 'mythology'] as WordTheme[]).map(theme => (
                <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Word Length Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min Word Length</label>
            <input
              type="number"
              min={2}
              max={12}
              value={options.minWordLength}
              onChange={(e) => updateOption('minWordLength', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Word Length</label>
            <input
              type="number"
              min={3}
              max={15}
              value={options.maxWordLength}
              onChange={(e) => updateOption('maxWordLength', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Separator & Capitalization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Separator</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['hyphen', 'underscore', 'dot', 'space', 'none', 'random'] as SeparatorType[]).map(sep => (
                <button
                  key={sep}
                  onClick={() => updateOption('separator', sep)}
                  className={`p-2 rounded-lg text-sm capitalize ${
                    options.separator === sep
                      ? 'bg-red-500/20 border border-red-500 text-red-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {sep}
                </button>
              ))}
            </div>
            {options.separator === 'random' && (
              <input
                type="text"
                value={options.customSeparator}
                onChange={(e) => updateOption('customSeparator', e.target.value)}
                placeholder="Custom separator"
                className="mt-2 w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Capitalization</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['lowercase', 'uppercase', 'title', 'camel', 'random'] as Capitalization[]).map(cap => (
                <button
                  key={cap}
                  onClick={() => updateOption('capitalization', cap)}
                  className={`p-2 rounded-lg text-sm ${
                    options.capitalization === cap
                      ? 'bg-red-500/20 border border-red-500 text-red-400'
                      : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Numbers & Symbols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
              <label className="text-sm font-medium text-gray-300">Include Numbers</label>
            </div>
            
            {options.includeNumbers && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Number of digits</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={options.addDigits}
                    onChange={(e) => updateOption('addDigits', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg accent-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Position</label>
                  <select
                    value={options.numberPosition}
                    onChange={(e) => updateOption('numberPosition', e.target.value as any)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="prefix">Prefix</option>
                    <option value="suffix">Suffix</option>
                    <option value="between">Between words</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
              <label className="text-sm font-medium text-gray-300">Include Symbols</label>
            </div>
            
            {options.includeSymbols && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Number of symbols</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={options.addSymbols}
                    onChange={(e) => updateOption('addSymbols', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg accent-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Position</label>
                  <select
                    value={options.symbolPosition}
                    onChange={(e) => updateOption('symbolPosition', e.target.value as any)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="prefix">Prefix</option>
                    <option value="suffix">Suffix</option>
                    <option value="between">Between words</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Words */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={options.useCustomWords}
              onChange={(e) => updateOption('useCustomWords', e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <label className="text-sm font-medium text-gray-300">Use Custom Words</label>
          </div>
          
          {options.useCustomWords && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  placeholder="Enter a word"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomWord()}
                />
                <button
                  onClick={addCustomWord}
                  className="px-4 py-2 bg-red-500 text-black rounded-lg hover:bg-red-400 transition font-medium"
                >
                  Add
                </button>
              </div>
              
              {options.customWords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {options.customWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1 group"
                    >
                      {word}
                      <button
                        onClick={() => removeCustomWord(i)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
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
                    <div className="text-sm font-mono">{item.password}</div>
                    <div className="text-xs text-gray-500">
                      {item.wordCount} words · {item.language} · {item.theme}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.password)}
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
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {favorites.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg group">
                  <div>
                    <div className="text-sm font-mono">{item.password}</div>
                    <div className="text-xs text-gray-500">
                      {item.wordCount} words · {item.language} · {item.theme}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.password)}
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

      {/* Info Box */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/30">
        <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
          <Sparkles size={14} />
          Why Memorable Passwords?
        </h3>
        <p className="text-xs text-gray-400">
          Memorable passwords are easier to remember but still secure. 
          A 4-word password like "correct-horse-battery-staple" provides 
          ~44 bits of entropy, similar to a random 8-character password, 
          but is much easier to recall.
        </p>
      </div>
    </div>
  )
}   
