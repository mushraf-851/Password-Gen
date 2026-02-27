import { useState, useCallback, useEffect } from "react";
import { 
  Copy, Check, RefreshCw, Shield, ShieldCheck, ShieldAlert, 
  History, Star, Download, Zap, Award, WifiOff,
  User, Hash, Globe, Gamepad2, Briefcase, Heart,
  Music, Camera, Code, Palette, Rocket,
  Key, CreditCard, Wifi, Fingerprint, Smartphone,
  MapPin, Globe2, Database
} from "lucide-react";

// Character sets
const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Username themes - EXPANDED with more variety
const USERNAME_THEMES = {
  gamer: ['Shadow', 'Ninja', 'Pro', 'Master', 'Elite', 'Legend', 'Ghost', 'Hunter', 'Warrior', 'Knight', 'Sniper', 'Assassin', 'Wizard', 'Dragon', 'Phoenix'],
  creative: ['Pixel', 'Neon', 'Cosmic', 'Dream', 'Magic', 'Mystic', 'Phoenix', 'Nova', 'Echo', 'Aurora', 'Crystal', 'Velvet', 'Quantum', 'Prism', 'Spectrum'],
  professional: ['Dev', 'Tech', 'Code', 'Cloud', 'Data', 'Cyber', 'Net', 'Byte', 'Logic', 'Alpha', 'Prime', 'Core', 'Swift', 'Smart', 'Expert'],
  social: ['Star', 'Heart', 'Smile', 'Sunny', 'Happy', 'Cool', 'Sweet', 'Kind', 'Bright', 'Swift', 'Chill', 'Vibe', 'Wave', 'Flow', 'Glow'],
  random: ['Fluffy', 'Sneaky', 'Wild', 'Crazy', 'Silent', 'Rapid', 'Turbo', 'Hyper', 'Ultra', 'Mega', 'Super', 'Epic', 'Awesome', 'Fantastic', 'Incredible'],
  business: ['CEO', 'Founder', 'Leader', 'Chief', 'Head', 'Director', 'Manager', 'Executive', 'Partner', 'Principal', 'Strategist', 'Advisor', 'Consultant', 'Specialist', 'Analyst'],
  startup: ['Hacker', 'Growth', 'Scale', 'Launch', 'Build', 'Create', 'Innovate', 'Disrupt', 'Founder', 'Maker', 'Builder', 'Creator', 'Developer', 'Engineer', 'Designer']
};

// Username suffixes for more variety
const USERNAME_SUFFIXES = ['123', '99', 'X', 'Pro', 'YT', 'TV', 'Live', 'Hub', 'Zone', 'Life', 'World', 'Real', 'Official', 'HQ', 'Inc'];
const USERNAME_PREFIXES = ['Mr', 'Mrs', 'Sir', 'The', 'Its', 'Just', 'Real', 'Official', 'Dr', 'Professor'];

// PIN patterns
const PIN_PATTERNS = {
  numeric: '0123456789',
  hexadecimal: '0123456789ABCDEF',
  alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

// Credit card BINs (first 6 digits)
const CARD_BINS = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55'],
  amex: ['34', '37'],
  discover: ['6011', '65'],
  jcb: ['35'],
  unionpay: ['62']
};

// Wi-Fi encryption types
const WIFI_ENCRYPTION = ['WEP', 'WPA', 'WPA2', 'WPA3', 'None'];

// OTP settings
const OTP_ALGORITHMS = ['SHA1', 'SHA256', 'SHA512'];
const OTP_DIGITS = [6, 7, 8];

// Memorable word lists
const ADJECTIVES = ['Happy', 'Sunny', 'Brave', 'Clever', 'Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Kind', 'Epic', 'Super', 'Ultra', 'Mega', 'Hyper'];
const NOUNS = ['Tiger', 'Eagle', 'Ocean', 'Mountain', 'Star', 'Forest', 'River', 'Cloud', 'Flower', 'Moon', 'Dragon', 'Phoenix', 'Wolf', 'Hawk', 'Lion'];
const VERBS = ['Jump', 'Run', 'Fly', 'Swim', 'Dance', 'Sing', 'Read', 'Write', 'Paint', 'Build', 'Code', 'Create', 'Design', 'Dream', 'Explore'];

// License plate formats by country
const LICENSE_FORMATS = {
  us: 'ABC 1234',
  uk: 'AB12 CDE',
  eu: 'AB-123-CD',
  jp: '12-34',
};

type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

interface HistoryItem {
  value: string;
  timestamp: number;
  type: string;
  metadata?: any;
}

// Generate password function
function generatePassword(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): string {
  let chars = "";
  if (options.uppercase) chars += CHARSETS.uppercase;
  if (options.lowercase) chars += CHARSETS.lowercase;
  if (options.numbers) chars += CHARSETS.numbers;
  if (options.symbols) chars += CHARSETS.symbols;
  if (!chars) chars = CHARSETS.lowercase;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

// Generate PIN
function generatePIN(length: number, pattern: string): string {
  let chars = pattern;
  if (!chars) chars = PIN_PATTERNS.numeric;
  
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

// Generate credit card
function generateCreditCard(type: string): { number: string; cvv: string; expiry: string } {
  const bin = CARD_BINS[type as keyof typeof CARD_BINS] || CARD_BINS.visa;
  const prefix = bin[Math.floor(Math.random() * bin.length)];
  
  let number = prefix;
  while (number.length < 15) {
    number += Math.floor(Math.random() * 10).toString();
  }
  
  // Luhn algorithm check digit
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = parseInt(number[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  number += checkDigit;
  
  // Format with spaces
  const formatted = number.match(/.{1,4}/g)?.join(' ') || number;
  
  const cvv = Math.floor(Math.random() * 900 + 100).toString();
  const expiry = `${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}/${String(Math.floor(Math.random() * 5 + 24)).padStart(2, '0')}`;
  
  return { number: formatted, cvv, expiry };
}

// Generate Wi-Fi password
function generateWiFiPassword(encryption: string): string {
  const length = encryption === 'WEP' ? 10 : 16;
  return generatePassword(length, { uppercase: true, lowercase: true, numbers: true, symbols: encryption !== 'WEP' });
}

// Generate OTP secret
function generateOTPSecret(algorithm: string, digits: number): string {
  const length = algorithm === 'SHA1' ? 20 : algorithm === 'SHA256' ? 32 : 64;
  return generatePassword(length, { uppercase: true, lowercase: false, numbers: true, symbols: false });
}

// Generate memorable password
function generateMemorablePassword(words: number, separator: string, capitalize: boolean): string {
  const selected = [];
  for (let i = 0; i < words; i++) {
    let word = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    if (i % 2 === 1) word = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    if (i % 3 === 2) word = VERBS[Math.floor(Math.random() * VERBS.length)];
    
    if (!capitalize) word = word.toLowerCase();
    selected.push(word);
  }
  
  const number = Math.floor(Math.random() * 100);
  return selected.join(separator) + number;
}

// Generate API key
function generateAPIKey(prefix: string, length: number, format: 'hex' | 'base64' | 'alphanumeric'): string {
  let chars = '';
  if (format === 'hex') chars = '0123456789abcdef';
  else if (format === 'base64') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  else chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  const key = Array.from(array, (v) => chars[v % chars.length]).join("");
  
  return prefix ? `${prefix}_${key}` : key;
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate License Plate
function generateLicensePlate(country: string, customFormat?: string): string {
  const formats: Record<string, string> = {
    us: 'ABC 1234',
    uk: 'AB12 CDE',
    eu: 'AB-123-CD',
    jp: '12-34',
  };
  
  let format = customFormat || formats[country] || formats.us;
  let result = '';
  
  for (let i = 0; i < format.length; i++) {
    const char = format[i];
    if (char === 'A' || char === 'B' || char === 'C') {
      result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } else if (char === '1' || char === '2' || char === '3') {
      result += Math.floor(Math.random() * 10).toString();
    } else {
      result += char;
    }
  }
  
  return result;
}

// Generate fake identity
function generateFakeIdentity(): { name: string; email: string; phone: string; address: string } {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Tom', 'Anna', 'Michael', 'Jessica', 'James', 'Emily', 'Robert'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com', 'protonmail.com', 'mail.com'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
  
  const phone = `(${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Pine Ln', 'Cedar Blvd', 'Washington Ave', 'Park St', 'Lake Dr', 'Hill St', 'River Rd'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];
  
  const address = `${Math.floor(Math.random() * 9000 + 100)} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(Math.random() * 90000 + 10000)}`;
  
  return { name: `${firstName} ${lastName}`, email, phone, address };
}

// Strength calculator
function getStrength(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): { level: StrengthLevel; label: string; percent: number; entropy: number } {
  let pool = 0;
  if (options.uppercase) pool += 26;
  if (options.lowercase) pool += 26;
  if (options.numbers) pool += 10;
  if (options.symbols) pool += 26;
  if (pool === 0) pool = 26;

  const entropy = Math.log2(pool) * length;

  if (entropy < 36) return { level: "weak", label: "Weak", percent: 25, entropy };
  if (entropy < 60) return { level: "fair", label: "Fair", percent: 50, entropy };
  if (entropy < 80) return { level: "strong", label: "Strong", percent: 75, entropy };
  return { level: "very-strong", label: "Very Strong", percent: 100, entropy };
}

// Strength colors
const strengthColors: Record<StrengthLevel, string> = {
  weak: "#ef4444",
  fair: "#f59e0b",
  strong: "#10b981",
  "very-strong": "#8b5cf6",
};

const StrengthIcons: Record<StrengthLevel, any> = {
  weak: ShieldAlert,
  fair: Shield,
  strong: ShieldCheck,
  "very-strong": Award,
};

// Generator types
type GeneratorType = 
  | 'password' 
  | 'username' 
  | 'pin' 
  | 'creditcard' 
  | 'wifi' 
  | 'otp' 
  | 'memorable' 
  | 'apikey' 
  | 'uuid' 
  | 'license' 
  | 'identity';

export default function PasswordGenerator() {
  const [activeTab, setActiveTab] = useState<GeneratorType>('password');
  
  // Common states
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Password states
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  
  // Username states
  const [usernameTheme, setUsernameTheme] = useState('gamer');
  const [usernameStyle, setUsernameStyle] = useState<'normal' | 'camel' | 'snake' | 'dot' | 'dash'>('normal');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // PIN states
  const [pinLength, setPinLength] = useState(6);
  const [pinPattern, setPinPattern] = useState('0123456789');
  const [pin, setPin] = useState("");
  
  // Credit card states
  const [cardType, setCardType] = useState('visa');
  const [cardData, setCardData] = useState({ number: '', cvv: '', expiry: '' });
  
  // Wi-Fi states
  const [wifiEncryption, setWifiEncryption] = useState('WPA2');
  const [wifiPassword, setWifiPassword] = useState("");
  
  // OTP states
  const [otpAlgorithm, setOtpAlgorithm] = useState('SHA1');
  const [otpDigits, setOtpDigits] = useState(6);
  const [otpSecret, setOtpSecret] = useState("");
  
  // Memorable password states
  const [wordCount, setWordCount] = useState(3);
  const [wordSeparator, setWordSeparator] = useState('-');
  const [capitalizeWords, setCapitalizeWords] = useState(true);
  const [memorablePassword, setMemorablePassword] = useState("");
  
  // API key states
  const [apiPrefix, setApiPrefix] = useState('sk');
  const [apiLength, setApiLength] = useState(32);
  const [apiFormat, setApiFormat] = useState<'hex' | 'base64' | 'alphanumeric'>('hex');
  const [apiKey, setApiKey] = useState("");
  
  // UUID state
  const [uuid, setUuid] = useState("");
  
  // License plate states
  const [licenseCountry, setLicenseCountry] = useState('us');
  const [customFormat, setCustomFormat] = useState('');
  const [licensePlate, setLicensePlate] = useState("");
  
  // Identity state
  const [identity, setIdentity] = useState({ name: '', email: '', phone: '', address: '' });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('allHistory');
    if (saved) {
      try {
        const parsed: HistoryItem[] = JSON.parse(saved);
        // normalize entries: some older/history values may accidentally be objects
        const normalized = parsed.map(item => {
          if (item && item.value && typeof item.value === 'object') {
            // prefer a password property or fall back to JSON string
            const obj: any = item.value as any;
            return {
              ...item,
              value: typeof obj.password === 'string'
                ? obj.password
                : JSON.stringify(obj)
            };
          }
          return item;
        });
        setHistory(normalized);
      } catch (e) {
        // if parse fails just ignore and leave history empty
      }
    }
    const favs = localStorage.getItem('favorites');
    if (favs) {
      try {
        const parsedFavs = JSON.parse(favs);
        // favorites should be strings; if an object slipped in, convert to string
        const normalizedFavs = parsedFavs.map((f: any) =>
          typeof f === 'object' && f !== null ? (f.password || JSON.stringify(f)) : f
        );
        setFavorites(normalizedFavs);
      } catch {}
    }
  }, []);

  // Generate based on active tab
  const generateCurrent = useCallback(() => {
    let value = '';
    let metadata = {};
    
    switch(activeTab) {
      case 'password':
        value = generatePassword(length, options);
        setPassword(value);
        break;
        
      case 'username':
        if (firstName || lastName) {
          // Generate from name with more variety
          const first = firstName || 'user';
          const last = lastName || 'name';
          const randomNum = Math.floor(Math.random() * 1000);
          const separators = ['.', '_', '-', ''];
          const separator = separators[Math.floor(Math.random() * separators.length)];
          
          const patterns = [
            `${first}${separator}${last}`,
            `${first}${last}`,
            `${first.charAt(0)}${last}`,
            `${first}${last.charAt(0)}`,
            `${first}${randomNum}`,
            `${last}${randomNum}`,
            `${first}${separator}${last}${randomNum}`,
          ];
          value = patterns[Math.floor(Math.random() * patterns.length)].toLowerCase();
        } else if (email) {
          value = email.split('@')[0];
          // Add random numbers for variety
          if (includeNumbers) {
            value += Math.floor(Math.random() * 1000);
          }
        } else {
          // Get theme words
          const themes = USERNAME_THEMES[usernameTheme as keyof typeof USERNAME_THEMES] || USERNAME_THEMES.random;
          
          // Select 1-2 words
          const wordCount = Math.random() > 0.5 ? 1 : 2;
          let words = [];
          for (let i = 0; i < wordCount; i++) {
            words.push(themes[Math.floor(Math.random() * themes.length)]);
          }
          
          let baseWord = words.join('');
          
          // Add prefix sometimes
          if (Math.random() > 0.7) {
            const prefix = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
            baseWord = prefix + baseWord;
          }
          
          value = baseWord;
          
          // Add numbers if enabled
          if (includeNumbers) {
            value += Math.floor(Math.random() * 1000);
          }
          
          // Add suffix sometimes
          if (Math.random() > 0.6 && !includeNumbers) {
            const suffix = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)];
            value += suffix;
          }
          
          // Apply style
          switch(usernameStyle) {
            case 'camel': 
              value = value.charAt(0).toLowerCase() + value.slice(1);
              break;
            case 'snake': 
              value = value.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
              break;
            case 'dot': 
              value = value.toLowerCase().replace(/([A-Z])/g, '.$1').replace(/^\./, '');
              break;
            case 'dash': 
              value = value.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
              break;
            default: // normal
              value = value.charAt(0).toUpperCase() + value.slice(1);
          }
        }
        setUsername(value);
        break;
        
      case 'pin':
        value = generatePIN(pinLength, pinPattern);
        setPin(value);
        break;
        
      case 'creditcard':
        const card = generateCreditCard(cardType);
        setCardData(card);
        value = card.number;
        metadata = { cvv: card.cvv, expiry: card.expiry };
        break;
        
      case 'wifi':
        value = generateWiFiPassword(wifiEncryption);
        setWifiPassword(value);
        metadata = { encryption: wifiEncryption };
        break;
        
      case 'otp':
        value = generateOTPSecret(otpAlgorithm, otpDigits);
        setOtpSecret(value);
        metadata = { algorithm: otpAlgorithm, digits: otpDigits };
        break;
        
      case 'memorable': {
        const mem = generateMemorablePassword(wordCount, wordSeparator, capitalizeWords);
        setMemorablePassword(mem);
        // store only the actual password string in history value
        value = mem.password;
        // include some useful metadata for later display
        metadata = {
          wordCount: mem.wordCount,
          language: mem.language,
          theme: mem.theme,
          strength: mem.strength,
          entropy: mem.entropy
        };
        break;
      }
        
      case 'apikey':
        value = generateAPIKey(apiPrefix, apiLength, apiFormat);
        setApiKey(value);
        break;
        
      case 'uuid':
        value = generateUUID();
        setUuid(value);
        break;
        
      case 'license':
        value = generateLicensePlate(licenseCountry, customFormat);
        setLicensePlate(value);
        break;
        
      case 'identity':
        const id = generateFakeIdentity();
        setIdentity(id);
        value = id.name;
        metadata = { email: id.email, phone: id.phone, address: id.address };
        break;
    }
    
    setCopied(false);

    // Add to history using functional update to avoid depending on `history`
    const newItem: HistoryItem = {
      value,
      timestamp: Date.now(),
      type: activeTab,
      metadata
    };
    // if somehow value is still an object, convert to string to avoid render issues
    if (newItem && typeof newItem.value === 'object' && newItem.value !== null) {
      const obj: any = newItem.value as any;
      newItem.value = typeof obj.password === 'string' ? obj.password : JSON.stringify(obj);
    }

    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('allHistory', JSON.stringify(updated));
      } catch (e) {
        // ignore storage errors
      }
      return updated;
    });
  }, [activeTab, length, options, usernameTheme, usernameStyle, includeNumbers, includeSymbols, firstName, lastName, email, pinLength, pinPattern, cardType, wifiEncryption, otpAlgorithm, otpDigits, wordCount, wordSeparator, capitalizeWords, apiPrefix, apiLength, apiFormat, licenseCountry, customFormat]);

  useEffect(() => {
    generateCurrent();
  }, [generateCurrent]);

  const copyToClipboard = async (text: string = getCurrentValue()) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentValue = (): string => {
    switch(activeTab) {
      case 'password': return password;
      case 'username': return username;
      case 'pin': return pin;
      case 'creditcard': return cardData.number;
      case 'wifi': return wifiPassword;
      case 'otp': return otpSecret;
      case 'memorable': return memorablePassword;
      case 'apikey': return apiKey;
      case 'uuid': return uuid;
      case 'license': return licensePlate;
      case 'identity': return identity.name;
      default: return '';
    }
  };

  const toggleFavorite = () => {
    const currentValue = getCurrentValue();
    const newFavs = favorites.includes(currentValue) 
      ? favorites.filter(f => f !== currentValue)
      : [...favorites, currentValue];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const exportData = () => {
    const data = {
      history,
      favorites,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generator-data-${Date.now()}.json`;
    a.click();
  };

  const strength = getStrength(length, options);
  const StrengthIcon = StrengthIcons[strength.level];

  // Filter history by current tab type
  const currentHistory = history.filter(item => item.type === activeTab);

  // Theme icons mapping
  const themeIcons: Record<GeneratorType, any> = {
    password: Key,
    username: User,
    pin: Fingerprint,
    creditcard: CreditCard,
    wifi: Wifi,
    otp: Smartphone,
    memorable: Music,
    apikey: Code,
    uuid: Database,
    license: MapPin,
    identity: Globe2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
              <WifiOff size={14} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">100% Local</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Zap size={14} className="text-purple-400" />
              <span className="text-xs font-medium text-purple-400">11 Generators</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ultimate Identity
            </span>{" "}
            <span className="text-white">Suite</span>
          </h1>
          
          <p className="text-gray-400 text-lg">
            11 powerful generators for all your digital identity needs
          </p>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {[
            { id: 'password', icon: Key, label: 'Password', color: 'green' },
            { id: 'username', icon: User, label: 'Username', color: 'blue' },
            { id: 'pin', icon: Fingerprint, label: 'PIN', color: 'purple' },
            { id: 'creditcard', icon: CreditCard, label: 'Credit Card', color: 'pink' },
            { id: 'wifi', icon: Wifi, label: 'Wi-Fi', color: 'yellow' },
            { id: 'otp', icon: Smartphone, label: 'OTP', color: 'indigo' },
            { id: 'memorable', icon: Music, label: 'Memorable', color: 'red' },
            { id: 'apikey', icon: Code, label: 'API Key', color: 'cyan' },
            { id: 'uuid', icon: Database, label: 'UUID', color: 'emerald' },
            { id: 'license', icon: MapPin, label: 'License', color: 'amber' },
            { id: 'identity', icon: Globe2, label: 'Identity', color: 'violet' },
          ].map((gen) => {
            const Icon = gen.icon;
            return (
              <button
                key={gen.id}
                onClick={() => setActiveTab(gen.id as GeneratorType)}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                  activeTab === gen.id
                    ? `bg-${gen.color}-500/20 border-2 border-${gen.color}-500 text-${gen.color}-400`
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{gen.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          {/* Display Area */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 font-mono text-xl bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[80px] break-all">
              {activeTab === 'password' && password}
              {activeTab === 'username' && username}
              {activeTab === 'pin' && pin}
              {activeTab === 'creditcard' && (
                <div>
                  <div>{cardData.number}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    CVV: {cardData.cvv} | Exp: {cardData.expiry}
                  </div>
                </div>
              )}
              {activeTab === 'wifi' && wifiPassword}
              {activeTab === 'otp' && otpSecret}
              {activeTab === 'memorable' && memorablePassword}
              {activeTab === 'apikey' && apiKey}
              {activeTab === 'uuid' && uuid}
              {activeTab === 'license' && licensePlate}
              {activeTab === 'identity' && (
                <div>
                  <div>{identity.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {identity.email} | {identity.phone}
                  </div>
                  <div className="text-sm text-gray-400">{identity.address}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={generateCurrent} 
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                title="Generate new"
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={() => copyToClipboard()} 
                className="p-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition font-medium"
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-3 rounded-lg transition ${
                  favorites.includes(getCurrentValue()) 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Add to favorites"
              >
                <Star size={20} fill={favorites.includes(getCurrentValue()) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Password Strength (only for password tab) */}
          {activeTab === 'password' && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <StrengthIcon size={18} style={{ color: strengthColors[strength.level] }} />
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${strength.percent}%`,
                      backgroundColor: strengthColors[strength.level]
                    }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: strengthColors[strength.level] }}>
                  {strength.label}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Entropy: {strength.entropy.toFixed(1)} bits</span>
                <span>Length: {length}</span>
              </div>
            </div>
          )}

          {/* Generator-specific controls */}
          <div className="space-y-6">
            {/* Password Controls */}
            {activeTab === 'password' && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-300">Length: {length}</label>
                    <div className="flex gap-1">
                      {[8, 12, 16, 20, 24, 32].map(l => (
                        <button
                          key={l}
                          onClick={() => setLength(l)}
                          className={`px-2 py-1 text-xs rounded ${
                            length === l 
                              ? 'bg-green-500 text-black' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min={4} 
                    max={64} 
                    value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['uppercase', 'lowercase', 'numbers', 'symbols'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        const newOptions = { ...options, [key]: !options[key as keyof typeof options] };
                        if (!newOptions.uppercase && !newOptions.lowercase && !newOptions.numbers && !newOptions.symbols) return;
                        setOptions(newOptions);
                      }}
                      className={`px-4 py-3 rounded-lg font-medium capitalize transition ${
                        options[key as keyof typeof options]
                          ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Username Controls */}
            {activeTab === 'username' && (
              <>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.keys(USERNAME_THEMES).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setUsernameTheme(theme)}
                      className={`p-2 rounded-lg text-xs capitalize ${
                        usernameTheme === theme
                          ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {(['normal', 'camel', 'snake', 'dot', 'dash'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setUsernameStyle(style)}
                      className={`p-2 rounded-lg text-xs capitalize ${
                        usernameStyle === style
                          ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {style === 'normal' ? 'Normal' : 
                       style === 'camel' ? 'Camel' :
                       style === 'snake' ? 'Snake' :
                       style === 'dot' ? 'Dot' : 'Dash'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Include numbers</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Include symbols</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </>
            )}

            {/* PIN Controls */}
            {activeTab === 'pin' && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-300">PIN Length: {pinLength}</label>
                  </div>
                  <input 
                    type="range" 
                    min={4} 
                    max={16} 
                    value={pinLength} 
                    onChange={(e) => setPinLength(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PIN_PATTERNS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setPinPattern(value)}
                      className={`p-2 rounded-lg text-sm capitalize ${
                        pinPattern === value
                          ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Credit Card Controls */}
            {activeTab === 'creditcard' && (
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CARD_BINS).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCardType(type)}
                    className={`p-2 rounded-lg text-sm capitalize ${
                      cardType === type
                        ? 'bg-pink-500/20 border-2 border-pink-500 text-pink-400'
                        : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {/* Wi-Fi Controls */}
            {activeTab === 'wifi' && (
              <div className="grid grid-cols-3 gap-2">
                {WIFI_ENCRYPTION.map((enc) => (
                  <button
                    key={enc}
                    onClick={() => setWifiEncryption(enc)}
                    className={`p-2 rounded-lg text-sm ${
                      wifiEncryption === enc
                        ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400'
                        : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {enc}
                  </button>
                ))}
              </div>
            )}

            {/* OTP Controls */}
            {activeTab === 'otp' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {OTP_ALGORITHMS.map((alg) => (
                    <button
                      key={alg}
                      onClick={() => setOtpAlgorithm(alg)}
                      className={`p-2 rounded-lg text-sm ${
                        otpAlgorithm === alg
                          ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {OTP_DIGITS.map((digits) => (
                    <button
                      key={digits}
                      onClick={() => setOtpDigits(digits)}
                      className={`p-2 rounded-lg text-sm ${
                        otpDigits === digits
                          ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {digits} digits
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Memorable Password Controls */}
            {activeTab === 'memorable' && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-300">Words: {wordCount}</label>
                  </div>
                  <input 
                    type="range" 
                    min={2} 
                    max={6} 
                    value={wordCount} 
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['-', '_', '.', ' '].map((sep) => (
                    <button
                      key={sep}
                      onClick={() => setWordSeparator(sep)}
                      className={`p-2 rounded-lg text-sm ${
                        wordSeparator === sep
                          ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {sep === ' ' ? 'space' : sep}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={capitalizeWords}
                    onChange={(e) => setCapitalizeWords(e.target.checked)}
                    className="accent-red-500"
                  />
                  <span>Capitalize words</span>
                </label>
              </>
            )}

            {/* API Key Controls */}
            {activeTab === 'apikey' && (
              <>
                <input
                  type="text"
                  value={apiPrefix}
                  onChange={(e) => setApiPrefix(e.target.value)}
                  placeholder="Prefix (e.g., sk)"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-300">Length: {apiLength}</label>
                  </div>
                  <input 
                    type="range" 
                    min={16} 
                    max={128} 
                    value={apiLength} 
                    onChange={(e) => setApiLength(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['hex', 'base64', 'alphanumeric'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setApiFormat(format)}
                      className={`p-2 rounded-lg text-sm capitalize ${
                        apiFormat === format
                          ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* License Plate Controls */}
            {activeTab === 'license' && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(LICENSE_FORMATS).map((country) => (
                    <button
                      key={country}
                      onClick={() => setLicenseCountry(country)}
                      className={`p-2 rounded-lg text-sm uppercase ${
                        licenseCountry === country
                          ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400'
                          : 'bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="Custom format (A=letter, 1=number)"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </>
            )}
          </div>
        </div>

        {/* History Panel - Now filtered by current generator type */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            Recent {activeTab === 'username' ? 'Usernames' : 
                   activeTab === 'password' ? 'Passwords' :
                   activeTab === 'pin' ? 'PINs' :
                   activeTab === 'creditcard' ? 'Credit Cards' :
                   activeTab === 'wifi' ? 'Wi-Fi Passwords' :
                   activeTab === 'otp' ? 'OTP Secrets' :
                   activeTab === 'memorable' ? 'Memorable Passwords' :
                   activeTab === 'apikey' ? 'API Keys' :
                   activeTab === 'uuid' ? 'UUIDs' :
                   activeTab === 'license' ? 'License Plates' :
                   activeTab === 'identity' ? 'Identities' : 'History'}
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {currentHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No history yet</p>
            ) : (
              currentHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <span className="font-mono text-sm block">
                    {typeof item.value === 'object' && item.value !== null
                      ? (item.value as any).password ?? String(item.value)
                      : item.value}
                  </span>
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <span className="text-xs text-gray-500">
                        {Object.entries(item.metadata).map(([key, val]) => `${key}: ${val}`).join(' | ')}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.value)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Favorites Panel */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            Favorites
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-500">No favorites yet</p>
            ) : (
              favorites.map((fav, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-700/50 rounded-lg">
                  <span className="font-mono text-sm">{fav}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => copyToClipboard(fav)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        const newFavs = favorites.filter(f => f !== fav);
                        setFavorites(newFavs);
                        localStorage.setItem('favorites', JSON.stringify(newFavs));
                      }}
                      className="p-1 hover:bg-gray-600 rounded text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={exportData}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
          >
            <Download size={18} />
            Export All Data
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="text-green-400 font-mono">crypto.getRandomValues()</span> — 
            all generation happens locally. Zero tracking. Zero servers.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            11 Generators: Password | Username | PIN | Credit Card | Wi-Fi | OTP | Memorable | API Key | UUID | License Plate | Identity
          </p>
        </div>
      </div>
    </div>
  );
}