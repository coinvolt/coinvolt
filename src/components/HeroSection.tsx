import { useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { BotCampaign } from '../types/coinvolt';

interface HeroSectionProps {
  campaigns: BotCampaign[];
  accountBalanceUsd: number;
  cumulativeVolumeUsd: number;
  onStartBotClick: () => void;
  onExplorePlansClick: () => void;
}

export function HeroSection({
  campaigns,
  accountBalanceUsd,
  cumulativeVolumeUsd,
  onStartBotClick,
  onExplorePlansClick,
}: HeroSectionProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  const activeGeneratedVolume = campaigns.reduce((acc, c) => acc + c.generatedVolumeUsd, 0);
  const totalVolumeMetric = cumulativeVolumeUsd + activeGeneratedVolume;
  const activeCampaignCount = campaigns.filter((c) => c.status === 'Running').length;

  return (
    <section id="overview" className="border-b border-white/[0.08] bg-[#07080A]">
      <div className="mx-auto max-w-[1380px] px-6 py-12 lg:py-16">
        {/* 2-Column Balanced Split */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Left Column: Value Proposition */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="text-xs font-medium tracking-wider text-[#FF6B00] uppercase">
                Automated DEX Liquidity &amp; Order Flow
              </p>

              <h1 className="mt-4 max-w-2xl font-[Outfit] text-[clamp(2.25rem,4vw,3.65rem)] font-bold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
                Institutional{' '}
                <span className="bg-gradient-to-r from-[#FF2E2E] via-[#FF6B00] to-[#FFD600] bg-clip-text text-transparent">
                  Volume Increase Bot
                </span>{' '}
                for Meme Coin Markets
              </h1>

              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-zinc-300">
                CoinVolt deploys distributed, MEV-protected maker wallets to execute continuous on-chain micro-swaps for your meme token. Fund your campaign with calibrated USD deposit packages—from $20 starter cycles to $5,000 institutional desks—and track real-time volume expansion from a unified trading terminal.
              </p>

              {/* Clean unboxed chain support metadata */}
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium">Supported Networks</span>
                <span aria-hidden="true">·</span>
                <span>Solana (Raydium / Pump.fun)</span>
                <span aria-hidden="true">·</span>
                <span>Ethereum (Uniswap V3)</span>
                <span aria-hidden="true">·</span>
                <span>Base (Aerodrome)</span>
                <span aria-hidden="true">·</span>
                <span>BNB Chain</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartBotClick}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFD600] px-6 py-3 text-sm font-semibold text-[#07080A] shadow-[0_0_28px_rgba(255,107,0,0.3)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]"
              >
                <span>Open Volume Bot Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExplorePlansClick}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0E1015] px-5 py-3 text-sm font-medium text-zinc-100 transition-colors duration-150 hover:border-[#FF6B00]/60 hover:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <span>View 10 Deposit Options</span>
              </button>

              <a
                href="https://x.com/thecoinvolt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CoinVolt official X account"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0E1015] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors duration-150 hover:border-[#FF6B00]/60 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@thecoinvolt</span>
              </a>
            </div>
          </div>

          {/* Right Column: High-Impact Brand Visual */}
          <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0E1015] lg:col-span-5">
            {!heroImgError ? (
              <img
                src="/src/assets/images/hero_coinvolt_terminal_1795706461914.jpg"
                alt="CoinVolt obsidian hardware vault illuminated by orange and yellow electric lightning beam"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgError(true)}
                className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
              />
            ) : (
              <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br from-[#0E1015] via-[#1B1109] to-[#260909]">
                <Zap className="h-14 w-14 text-[#FF6B00]" aria-hidden="true" />
              </div>
            )}

            {/* Measured contrast scrim */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/55 to-transparent"
            />

            {/* Bottom overlay readout */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-[#07080A]/85 p-4 backdrop-blur-md">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#FF6B00]/40 bg-[#0E1015]">
                  {!emblemImgError ? (
                    <img
                      src="/src/assets/images/coinvolt_emblem_core_1795706462563.jpg"
                      alt="CoinVolt Titanium Lightning Core"
                      referrerPolicy="no-referrer"
                      onError={() => setEmblemImgError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Zap className="h-6 w-6 text-[#FFD600]" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#FFD600]">CoinVolt Execution Engine</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-white">
                    10 Calibrated Deposit Tiers · Up to 50× Volume
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-zinc-400 tabular-nums">
                    Vault Balance: ${accountBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip Below Hero Split */}
        <div className="mt-8 grid grid-cols-1 divide-y divide-white/[0.08] rounded-xl border border-white/[0.08] bg-[#0E1015] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-zinc-400">Cumulative Bot Volume</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-white tabular-nums">
              ${totalVolumeMetric.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-xs text-[#FFD600]">Across all supported meme pairs</p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-medium text-zinc-400">Entry Deposit Minimum</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-white tabular-nums">
              $20.00 <span className="text-sm font-normal text-zinc-400">→ $200 Vol</span>
            </p>
            <p className="mt-1 text-xs text-zinc-400">10 standardized USD funding options</p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-medium text-zinc-400">Maximum Tier Capacity</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-white tabular-nums">
              $500 <span className="text-sm font-normal text-zinc-400">→ $15,000+ Vol</span>
            </p>
            <p className="mt-1 text-xs text-[#FF6B00]">Scales up to $250,000 volume</p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-medium text-zinc-400">Your Active Bot Campaigns</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-white tabular-nums">
              {activeCampaignCount} <span className="text-sm font-normal text-zinc-400">Running</span>
            </p>
            <p className="mt-1 text-xs text-zinc-400">Real-time execution telemetry enabled</p>
          </div>
        </div>
      </div>
    </section>
  );
}
