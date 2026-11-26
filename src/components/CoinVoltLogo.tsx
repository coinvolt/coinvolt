interface CoinVoltLogoProps {
  size?: number;
}

export function CoinVoltLogo({ size = 32 }: CoinVoltLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="cv-bolt-grad" x1="12" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="55%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FF2E2E" />
        </linearGradient>
        <linearGradient id="cv-ring-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFD600" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF2E2E" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="9"
        fill="#0B0C10"
        stroke="url(#cv-ring-grad)"
        strokeWidth="1.5"
      />
      <path
        d="M22.5 7.5L11.5 21.5H19.5L17.2 32.5L28.5 18.2H20.3L22.5 7.5Z"
        fill="url(#cv-bolt-grad)"
      />
    </svg>
  );
}
