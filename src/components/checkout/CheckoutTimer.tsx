import { useState, useEffect, useCallback, useMemo } from 'react';
import { CONFIG } from '../../config';

interface Props {
  expiresAt: string;
  onExpire: () => void;
}

// ─── UTC Parser ───────────────────────────────────────────────────────────────
// El backend puede mandar "2026-03-04 19:45:26.765" (sin Z) o "...T...Z"
// Siempre lo interpretamos como UTC, dejando que el navegador convierta
// automáticamente a la zona horaria LOCAL del usuario para el countdown.
function parseAsUTC(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  // Ya tiene offset explícito → confiar
  if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }
  // Sin Z ni offset → asumir UTC y agregar Z
  return new Date(dateStr.trim().replace(' ', 'T') + 'Z');
}

// ─── Color utilities ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

// Luminancia relativa (WCAG 2.1)
function luminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Ratio de contraste (WCAG): mínimo 4.5:1 para texto pequeño
function contrastRatio(rgb1: [number,number,number], rgb2: [number,number,number]): number {
  const L1 = luminance(...rgb1);
  const L2 = luminance(...rgb2);
  const lighter = Math.max(L1, L2);
  const darker  = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Devuelve el color de texto (#fff o #000) con mejor contraste sobre un fondo dado
function accessibleTextColor(bgHex: string): string {
  const bg = hexToRgb(bgHex);
  const white: [number,number,number] = [255, 255, 255];
  const black: [number,number,number] = [0, 0, 0];
  return contrastRatio(bg, white) >= contrastRatio(bg, black) ? '#ffffff' : '#000000';
}

// Aclara un color hex en un porcentaje (0-1) para fondos secundarios
function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  return `#${clamp(r).toString(16).padStart(2,'0')}${clamp(g).toString(16).padStart(2,'0')}${clamp(b).toString(16).padStart(2,'0')}`;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const { PRIMARY, BACKGROUND } = CONFIG.THEME;
const TTL_SECONDS      = CONFIG.RESERVATION_TTL_MINUTES * 60;
const WARNING_THRESHOLD = Math.max(60, Math.floor(TTL_SECONDS * 0.15)); // 15% del total o mín 60s

const PRIMARY_RGB  = hexToRgb(PRIMARY);
const PRIMARY_RGBA = `${PRIMARY_RGB[0]},${PRIMARY_RGB[1]},${PRIMARY_RGB[2]}`;
const BG_RGB       = hexToRgb(BACKGROUND);
const BG_RGBA      = `${BG_RGB[0]},${BG_RGB[1]},${BG_RGB[2]}`;

// Colores de advertencia: rojo fijo con buen contraste
const WARN_BG      = '#c0350d';
const WARN_BG_RGB  = hexToRgb(WARN_BG);
const WARN_RGBA    = `${WARN_BG_RGB[0]},${WARN_BG_RGB[1]},${WARN_BG_RGB[2]}`;

// Texto sobre pill normal (bg oscuro): garantizar contraste
const NORMAL_PILL_BG: [number,number,number] = [
  Math.round(BG_RGB[0] * 0.9 + 20),
  Math.round(BG_RGB[1] * 0.9 + 20),
  Math.round(BG_RGB[2] * 0.9 + 20),
];
const PILL_TEXT  = contrastRatio(NORMAL_PILL_BG, [255,255,255]) >= 4.5 ? '#ffffff' : '#111111';
const PILL_MUTED = contrastRatio(NORMAL_PILL_BG, [200,200,200]) >= 3   ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';

// Texto sobre advertencia
const WARN_TEXT  = accessibleTextColor(WARN_BG);
const WARN_MUTED = WARN_TEXT === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=DM+Sans:wght@400;500&display=swap');

  .trak-timer-root {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    pointer-events: none;
    width: max-content;
    max-width: calc(100vw - 1.5rem);
  }

  .trak-timer-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem 0.5rem 0.7rem;
    border-radius: 100px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: background 0.5s, border-color 0.5s, box-shadow 0.5s;
    animation: trak-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }

  @keyframes trak-enter {
    from { opacity: 0; transform: translateY(16px) scale(0.85); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Normal */
  .trak-timer-pill.normal {
    background: rgba(${BG_RGBA},0.88);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 6px 28px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
  }

  /* Warning */
  .trak-timer-pill.warning {
    background: rgba(${WARN_RGBA},0.95);
    border: 1px solid rgba(255,120,80,0.3);
    box-shadow: 0 6px 28px rgba(${WARN_RGBA},0.5), 0 0 0 1px rgba(255,120,80,0.15);
    animation:
      trak-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) both,
      trak-pulse 2s ease-in-out 0.4s infinite;
  }

  @keyframes trak-pulse {
    0%,100% { box-shadow: 0 6px 28px rgba(${WARN_RGBA},0.5),  0 0 0 1px rgba(255,120,80,0.15); }
    50%      { box-shadow: 0 6px 40px rgba(${WARN_RGBA},0.75), 0 0 0 4px rgba(255,120,80,0.25); }
  }

  /* ── Dot ── */
  .trak-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .trak-dot.normal {
    background: rgba(${PRIMARY_RGBA},1);
    box-shadow: 0 0 7px rgba(${PRIMARY_RGBA},0.8);
    animation: trak-blink 2.2s ease-in-out infinite;
  }
  .trak-dot.warning {
    background: ${WARN_TEXT};
    box-shadow: 0 0 7px rgba(255,255,255,0.5);
    animation: trak-blink 0.7s ease-in-out infinite;
  }

  @keyframes trak-blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.2; }
  }

  /* ── Label ── */
  .trak-label {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .trak-label.normal  { color: ${PILL_MUTED}; }
  .trak-label.warning { color: ${WARN_MUTED}; }

  /* En pantallas muy pequeñas ocultar label */
  @media (max-width: 380px) {
    .trak-label { display: none; }
  }

  /* ── Countdown ── */
  .trak-count {
    font-family: 'DM Mono', monospace;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    min-width: 3.2rem;
    text-align: center;
  }
  .trak-count.normal  { color: ${PILL_TEXT}; }
  .trak-count.warning { color: ${WARN_TEXT}; }

  /* ── Progress bar ── */
  .trak-bar-track {
    width: 48px;
    height: 3px;
    border-radius: 99px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .trak-bar-track.normal  { background: rgba(255,255,255,0.12); }
  .trak-bar-track.warning { background: rgba(0,0,0,0.2); }

  .trak-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1s linear, background 0.5s;
  }
  .trak-bar-fill.normal  { background: rgba(${PRIMARY_RGBA},0.85); }
  .trak-bar-fill.warning { background: ${WARN_TEXT}; }

  @media (max-width: 380px) {
    .trak-bar-track { display: none; }
  }
`

// ─── Component ────────────────────────────────────────────────────────────────
export const TicketrakTimer = ({ expiresAt, onExpire }: Props) => {
  // Zona horaria local del usuario (solo informacional, no afecta el cálculo)
  const userTZ = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const calculateTimeLeft = useCallback(() => {
    // parseAsUTC garantiza que el servidor UTC se compare contra Date.now() UTC
    // La diferencia en ms es absoluta — no depende de la zona horaria del usuario
    const diff = parseAsUTC(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }, [expiresAt]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  if (timeLeft <= 0) return null;

  const minutes  = Math.floor(timeLeft / 60);
  const seconds  = timeLeft % 60;
  const isWarning = timeLeft <= WARNING_THRESHOLD;
  const state     = isWarning ? 'warning' : 'normal';
  const progress  = Math.min(100, (timeLeft / TTL_SECONDS) * 100);

  return (
    <>
      <style>{styles}</style>
      <div
        className="trak-timer-root"
        role="timer"
        aria-live="polite"
        aria-label={`Reserva expira en ${minutes} minutos y ${seconds} segundos`}
        title={`Zona horaria detectada: ${userTZ}`}
      >
        <div className={`trak-timer-pill ${state}`}>

          {/* Dot parpadeante */}
          <span className={`trak-dot ${state}`} aria-hidden="true" />

          {/* Label contextual */}
          <span className={`trak-label ${state}`}>
            {isWarning ? '¡Apúrate!' : 'Expira en'}
          </span>

          {/* Tiempo */}
          <span className={`trak-count ${state}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>

          {/* Barra de progreso */}
          <div className={`trak-bar-track ${state}`} aria-hidden="true">
            <div
              className={`trak-bar-fill ${state}`}
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>
      </div>
    </>
  );
};