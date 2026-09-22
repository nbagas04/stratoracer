/**
 * Parse numeric input supporting both period and comma as decimal separator
 */
export function parseNumberInput(value: string | number | undefined): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Replace Indonesian comma with dot and trim
  const sanitized = value.toString().replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses pace input strings like "90", "90.5", "90,5", "1:30", "1:30.45"
 * Returns pace in seconds, or null if invalid
 */
export function parsePaceInput(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim().replace(',', '.');
  if (clean === '') return null;

  if (clean.includes(':')) {
    const parts = clean.split(':');
    if (parts.length === 2) {
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
        return null;
      }
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1]);
      const seconds = parseFloat(parts[2]);
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return null;
  }

  const sec = parseFloat(clean);
  return isNaN(sec) || sec <= 0 ? null : sec;
}

/**
 * Formats seconds into mm:ss.ms pace string, e.g. 90.5 -> "1:30.50"
 */
export function formatPace(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0:00.00';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const sStr = s < 10 ? `0${s.toFixed(2)}` : s.toFixed(2);
  return `${m}:${sStr}`;
}

/**
 * Formats minutes into race standard "Xh Ym Zs"
 * e.g. 482.5 min -> "8h 02m 30s"
 */
export function formatRaceTime(minutes: number, showHoursAlways = true): string {
  if (isNaN(minutes)) return '0h 00m 00s';
  const isNegative = minutes < 0;
  const absTotalSeconds = Math.round(Math.abs(minutes) * 60);
  
  const h = Math.floor(absTotalSeconds / 3600);
  const m = Math.floor((absTotalSeconds % 3600) / 60);
  const s = absTotalSeconds % 60;

  const mStr = m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;
  const sign = isNegative ? '-' : '';

  if (!showHoursAlways && h === 0) {
    return `${sign}${m}m ${sStr}s`;
  }
  return `${sign}${h}h ${mStr}m ${sStr}s`;
}

/**
 * Formats delta time from target in minutes
 * e.g. +2.5 min -> "+02m 30s (+0.52%)" or "-0.8 min" -> "-00m 48s (-0.17%)"
 */
export function formatDeltaTime(deltaMinutes: number, deltaPercent: number): {
  text: string;
  isPositive: boolean;
  isExact: boolean;
  colorClass: string;
} {
  const isExact = Math.abs(deltaMinutes) < 0.001;
  const isPositive = deltaMinutes > 0;
  const sign = isExact ? '±' : isPositive ? '+' : '-';
  const absSec = Math.round(Math.abs(deltaMinutes) * 60);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;
  const pct = Math.abs(deltaPercent).toFixed(2);

  const text = `${sign}${mStr}m ${sStr}s (${sign}${pct}%)`;

  let colorClass = 'text-emerald-400';
  if (Math.abs(deltaPercent) > 3) {
    colorClass = 'text-amber-400';
  } else if (Math.abs(deltaPercent) > 4.5) {
    colorClass = 'text-rose-400';
  }

  return {
    text,
    isPositive,
    isExact,
    colorClass,
  };
}

/**
 * Formats decimal with precision
 */
export function formatDecimal(val: number, precision = 2): string {
  if (isNaN(val)) return '0.00';
  return val.toFixed(precision);
}
