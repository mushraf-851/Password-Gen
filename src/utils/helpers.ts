import { Shield, ShieldCheck, ShieldAlert, Award } from "lucide-react";

// Types
export type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

export interface HistoryItem {
  value: string;
  timestamp: number;
  type: string;
  metadata?: any;
}

export interface StrengthResult {
  level: StrengthLevel;
  label: string;
  percent: number;
  entropy: number;
}

// Calculate password strength
export function getStrength(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): StrengthResult {
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

// Strength colors mapping
export const strengthColors: Record<StrengthLevel, string> = {
  weak: "#ef4444",
  fair: "#f59e0b",
  strong: "#10b981",
  "very-strong": "#8b5cf6",
};

// Strength icons mapping
export const StrengthIcons: Record<StrengthLevel, any> = {
  weak: ShieldAlert,
  fair: Shield,
  strong: ShieldCheck,
  "very-strong": Award,
};

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

// Format value for display
export function formatValue(value: any, format: "text" | "json" | "html" = "text"): string {
  if (format === "json") {
    return JSON.stringify(value, null, 2);
  }
  if (format === "html") {
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  return String(value);
}

// Download helper
export function downloadAsFile(content: string, filename: string, type: string = "text/plain"): void {
  const element = document.createElement("a");
  element.setAttribute("href", `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Validate password strength
export function isStrongPassword(
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean },
  minLength: number = 12
): (length: number) => boolean {
  return (length: number) => {
    const strength = getStrength(length, options);
    return strength.level === "strong" || strength.level === "very-strong";
  };
}

// Generate random color for UI elements
export function getRandomColor(): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Format timer duration
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle helper
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
