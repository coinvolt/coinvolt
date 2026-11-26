import { CoinVoltLogo } from './CoinVoltLogo';
import { ActiveSection } from './TopBar';

interface FooterProps {
  onNavigate: (section: ActiveSection) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07080A] py-10">
      <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-6 px-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <CoinVoltLogo size={26} />
          <div>
            <span className="font-[Outfit] text-base font-bold text-white">
              Coin<span className="text-[#FF6B00]">Volt</span>
            </span>
            <p className="text-xs text-zinc-500">
              Automated Meme Coin Volume Increase Bot &amp; Liquidity Infrastructure
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs text-zinc-400" aria-label="Footer navigation">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="hover:text-white cursor-pointer"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('plans')}
            className="hover:text-white cursor-pointer"
          >
            10 Deposit Plans
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bot')}
            className="hover:text-white cursor-pointer"
          >
            Volume Bot
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="hover:text-white cursor-pointer"
          >
            Dashboard
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://x.com/thecoinvolt"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow CoinVolt on X"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0E1015] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-[#FF6B00] hover:text-white whitespace-nowrap shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>@thecoinvolt</span>
          </a>

          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} CoinVolt Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
