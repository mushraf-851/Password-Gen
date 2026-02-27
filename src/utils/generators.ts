import {
  CHARSETS,
  PIN_PATTERNS,
  CARD_BINS,
  WIFI_ENCRYPTION,
  OTP_ALGORITHMS,
  OTP_DIGITS,
  ADJECTIVES,
  NOUNS,
  VERBS,
  USERNAME_THEMES,
  USERNAME_PREFIXES,
  USERNAME_SUFFIXES,
} from './constants';

// Generate password
export function generatePassword(
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
export function generatePIN(length: number, pattern: string): string {
  let chars = pattern;
  if (!chars) chars = PIN_PATTERNS.numeric;
  
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

// Generate credit card
export function generateCreditCard(type: string): { number: string; cvv: string; expiry: string } {
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
export function generateWiFiPassword(encryption: string): string {
  const length = encryption === 'WEP' ? 10 : 16;
  return generatePassword(length, { uppercase: true, lowercase: true, numbers: true, symbols: encryption !== 'WEP' });
}

// Generate OTP secret
export function generateOTPSecret(algorithm: string, digits: number): string {
  const length = algorithm === 'SHA1' ? 20 : algorithm === 'SHA256' ? 32 : 64;
  return generatePassword(length, { uppercase: true, lowercase: false, numbers: true, symbols: false });
}

// Generate memorable password
export function generateMemorablePassword(words: number, separator: string, capitalize: boolean): string {
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
export function generateAPIKey(prefix: string, length: number, format: 'hex' | 'base64' | 'alphanumeric'): string {
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
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate License Plate
export function generateLicensePlate(country: string, customFormat?: string): string {
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
export function generateFakeIdentity(): { name: string; email: string; phone: string; address: string } {
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

// Generate username
export function generateUsername(theme: string, includeNumber: boolean = true, includeSpecial: boolean = false): string {
  const themeWords = USERNAME_THEMES[theme as keyof typeof USERNAME_THEMES] || USERNAME_THEMES.random;
  const word = themeWords[Math.floor(Math.random() * themeWords.length)];
  
  let username = word;
  
  if (includeSpecial && Math.random() > 0.5) {
    const prefix = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
    username = prefix + username;
  }
  
  if (includeNumber) {
    const suffix = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)];
    username = username + suffix;
  }
  
  return username;
}
