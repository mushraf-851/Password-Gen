// Character sets
export const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Username themes
export const USERNAME_THEMES = {
  gamer: ['Shadow', 'Ninja', 'Pro', 'Master', 'Elite', 'Legend', 'Ghost', 'Hunter', 'Warrior', 'Knight', 'Sniper', 'Assassin', 'Wizard', 'Dragon', 'Phoenix'],
  creative: ['Pixel', 'Neon', 'Cosmic', 'Dream', 'Magic', 'Mystic', 'Phoenix', 'Nova', 'Echo', 'Aurora', 'Crystal', 'Velvet', 'Quantum', 'Prism', 'Spectrum'],
  professional: ['Dev', 'Tech', 'Code', 'Cloud', 'Data', 'Cyber', 'Net', 'Byte', 'Logic', 'Alpha', 'Prime', 'Core', 'Swift', 'Smart', 'Expert'],
  social: ['Star', 'Heart', 'Smile', 'Sunny', 'Happy', 'Cool', 'Sweet', 'Kind', 'Bright', 'Swift', 'Chill', 'Vibe', 'Wave', 'Flow', 'Glow'],
  random: ['Fluffy', 'Sneaky', 'Wild', 'Crazy', 'Silent', 'Rapid', 'Turbo', 'Hyper', 'Ultra', 'Mega', 'Super', 'Epic', 'Awesome', 'Fantastic', 'Incredible'],
  business: ['CEO', 'Founder', 'Leader', 'Chief', 'Head', 'Director', 'Manager', 'Executive', 'Partner', 'Principal', 'Strategist', 'Advisor', 'Consultant', 'Specialist', 'Analyst'],
  startup: ['Hacker', 'Growth', 'Scale', 'Launch', 'Build', 'Create', 'Innovate', 'Disrupt', 'Founder', 'Maker', 'Builder', 'Creator', 'Developer', 'Engineer', 'Designer']
};

export const USERNAME_SUFFIXES = ['123', '99', 'X', 'Pro', 'YT', 'TV', 'Live', 'Hub', 'Zone', 'Life', 'World', 'Real', 'Official', 'HQ', 'Inc'];
export const USERNAME_PREFIXES = ['Mr', 'Mrs', 'Sir', 'The', 'Its', 'Just', 'Real', 'Official', 'Dr', 'Professor'];

// PIN patterns
export const PIN_PATTERNS = {
  numeric: '0123456789',
  hexadecimal: '0123456789ABCDEF',
  alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

// Credit card BINs
export const CARD_BINS = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55'],
  amex: ['34', '37'],
  discover: ['6011', '65'],
  jcb: ['35'],
  unionpay: ['62']
};

// Wi-Fi encryption
export const WIFI_ENCRYPTION = ['WEP', 'WPA', 'WPA2', 'WPA3', 'None'];

// OTP settings
export const OTP_ALGORITHMS = ['SHA1', 'SHA256', 'SHA512'];
export const OTP_DIGITS = [6, 7, 8];

// Word lists
export const ADJECTIVES = ['Happy', 'Sunny', 'Brave', 'Clever', 'Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Kind', 'Epic', 'Super', 'Ultra', 'Mega', 'Hyper'];
export const NOUNS = ['Tiger', 'Eagle', 'Ocean', 'Mountain', 'Star', 'Forest', 'River', 'Cloud', 'Flower', 'Moon', 'Dragon', 'Phoenix', 'Wolf', 'Hawk', 'Lion'];
export const VERBS = ['Jump', 'Run', 'Fly', 'Swim', 'Dance', 'Sing', 'Read', 'Write', 'Paint', 'Build', 'Code', 'Create', 'Design', 'Dream', 'Explore'];

// License plate formats
export const LICENSE_FORMATS = {
  us: 'ABC 1234',
  uk: 'AB12 CDE',
  eu: 'AB-123-CD',
  jp: '12-34',
};