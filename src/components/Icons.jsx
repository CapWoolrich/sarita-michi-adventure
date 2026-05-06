/**
 * Iconos SVG kawaii — vectores limpios, listos para color via currentColor.
 * Reutilizables en HUD, botones de acción y panels.
 */

export const PawIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <ellipse cx="6" cy="11" rx="2" ry="2.6" />
    <ellipse cx="10" cy="7.6" rx="1.9" ry="2.4" />
    <ellipse cx="14" cy="7.6" rx="1.9" ry="2.4" />
    <ellipse cx="18" cy="11" rx="2" ry="2.6" />
    <path d="M12 12.5c-3.3 0-6 2.4-6 5.2 0 1.7 1.4 2.8 3 2.8 1 0 1.7-.4 3-.4s2 .4 3 .4c1.6 0 3-1.1 3-2.8 0-2.8-2.7-5.2-6-5.2z" />
  </svg>
);

export const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.5l2.7 6.4 6.9.6-5.2 4.6 1.6 6.7L12 17.4l-6 3.4 1.6-6.7L2.4 9.5l6.9-.6L12 2.5z" />
  </svg>
);

export const TimeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="13" r="8" fill="currentColor" fillOpacity="0.18" />
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2" />
    <path d="M9 3h6" />
  </svg>
);

export const PauseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="6.5" y="5" width="4" height="14" rx="1.4" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.4" />
  </svg>
);

export const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 4.8v14.4c0 1 1.1 1.6 2 1.1l11.2-7.2c.8-.5.8-1.7 0-2.2L9 3.7c-.9-.5-2 .1-2 1.1z" />
  </svg>
);

export const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.6L2 11h2.5v9.4c0 .9.7 1.6 1.6 1.6h3.7v-6h4.4v6h3.7c.9 0 1.6-.7 1.6-1.6V11H22L12 2.6z" />
  </svg>
);

export const VolumeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 10v4h4l5 4V6L7 10H3z" />
    <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M19 6a8 8 0 010 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const MuteIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 10v4h4l5 4V6L7 10H3z" />
    <path d="M15 9l6 6M21 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const MapIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 6.5L9 4l6 2.5 6-2.5v13L15 19.5 9 17 3 19.5z" opacity="0.85" />
    <path d="M9 4v13M15 6.5v13" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none" />
  </svg>
);

export const JumpIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 3l-5 6h3v5h4V9h3l-5-6z" />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const FastIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2L3 14h6l-1 8 11-13h-7l1-7z" />
  </svg>
);
