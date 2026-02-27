// Password Strength Types
export type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

export interface StrengthResult {
  level: StrengthLevel;
  label: string;
  percent: number;
  entropy: number;
}

// History and Favorites
export interface HistoryItem {
  value: string;
  timestamp: number;
  type: string;
  metadata?: any;
}

// Generator Types
export type GeneratorType = 
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

// Credit Card
export interface CreditCardResult {
  number: string;
  cvv: string;
  expiry: string;
}

// Identity
export interface FakeIdentity {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Password Options
export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

// Username Styles
export type UsernameStyle = 'normal' | 'camel' | 'snake' | 'dot' | 'dash';

// API Key Format
export type APIKeyFormat = 'hex' | 'base64' | 'alphanumeric';

// Component Props
export interface GeneratorComponentProps {
  onGenerate?: (value: string | any) => void;
  onCopy?: (value: string) => void;
  onAddToFavorites?: (value: string) => void;
}

// Settings
export interface AppSettings {
  theme?: 'light' | 'dark';
  autoGenerate?: boolean;
  showStrength?: boolean;
  copyNotification?: boolean;
  historyEnabled?: boolean;
  maxHistoryItems?: number;
}

// UI State
export interface UIState {
  activeTab: GeneratorType;
  copied: boolean;
  loading: boolean;
  error?: string;
}

// Tab Configuration
export interface TabConfig {
  id: GeneratorType;
  label: string;
  icon: any;
  description: string;
}
