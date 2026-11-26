import { CoinVoltLogo } from './CoinVoltLogo';

export type ActiveSection = 'overview' | 'plans' | 'bot' | 'dashboard';

interface TopBarProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  onOpenDeposit: () => void;
}

const NAV_ITEMS: { id: ActiveSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'plans', label: 'Deposit Plans' },
  { id: 'bot', label: 'Volume Bot' },
  { id: 'dashboard', label: 'Dashboard' },
];

export function TopBar({ activeSection, onNavigate, onOpenDeposit }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md"
        >
          <CoinVoltLogo size={30} />
          <span className="font-[Outfit] text-xl font-bold tracking-tight text-white">
            Coin<span className="text-[#FF6B00]">Volt</span>
          </span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#FF2E2E] via-[#FF6B00] to-[#FFD600]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenDeposit}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFB800] px-4 py-2 text-sm font-semibold text-[#07080A] shadow-[0_0_24px_rgba(255,107,0,0.28)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]"
          >
            Deposit Funds
          </button>
        </div>
      </div>

      {/* Compact mobile nav bar */}
      <nav
        className="flex md:hidden items-center justify-around border-t border-white/[0.06] px-4 py-2"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'text-[#FFD600]' : 'text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
