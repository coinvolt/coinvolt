import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { DEPOSIT_TIERS } from '../data/plans';
import { DepositTier } from '../types/coinvolt';

interface DepositPlansSectionProps {
  selectedTierId: string;
  onSelectTierForBot: (tier: DepositTier) => void;
  onDepositWithTier: (tier: DepositTier) => void;
}

export function DepositPlansSection({
  selectedTierId,
  onSelectTierForBot,
  onDepositWithTier,
}: DepositPlansSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');

  return (
    <section id="plans" className="border-b border-white/[0.08] bg-[#07080A] py-14">
      <div className="mx-auto max-w-[1380px] px-6">
        {/* Section Header + Functional Segmented View Switch */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#FF6B00] uppercase">
              Calibrated Liquidity Packages
            </p>
            <h2 className="mt-2 font-[Outfit] text-2xl font-bold tracking-tight text-white sm:text-3xl [text-wrap:balance]">
              10 Money Deposit Options for Automated Volume Scaling
            </h2>
            <p className="mt-2.5 max-w-[68ch] text-sm leading-relaxed text-zinc-400">
              Select a transparent USD deposit tier tailored to your meme coin&apos;s market capitalization. Each package allocates dedicated maker wallets, randomized trade sizing, and scheduled order flow to deliver verified on-chain volume.
            </p>
          </div>

          <div
            className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-white/[0.08] bg-[#0E1015] p-1 md:self-auto"
            role="tablist"
            aria-label="Deposit plans layout"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FF6B00] text-[#07080A] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              10 Tier Cards
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'matrix'}
              onClick={() => setViewMode('matrix')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#FF6B00] text-[#07080A] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Comparison Table
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DEPOSIT_TIERS.map((tier) => {
              const isSelected = tier.id === selectedTierId;
              return (
                <article
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-xl border p-5 transition-colors duration-150 ${
                    isSelected
                      ? 'border-[#FF6B00] bg-[#14171F]'
                      : tier.featured
                        ? 'border-[#FF6B00]/35 bg-[#0E1015] hover:border-[#FF6B00]/70'
                        : 'border-white/[0.08] bg-[#0E1015] hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Clean unboxed metadata row */}
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono tabular-nums">
                        Option {String(tier.tierNumber).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-[#FFD600]">{tier.multiplierLabel}</span>
                    </div>

                    <h3 className="mt-2 font-[Outfit] text-lg font-semibold text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">{tier.targetAudience}</p>

                    {/* Deposit -> Target Volume Readout */}
                    <div className="mt-4 border-y border-white/[0.07] py-3.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">Deposit</span>
                        <span className="font-mono text-xl font-bold text-white tabular-nums">
                          ${tier.depositUsd.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">Target Volume</span>
                        <span className="font-mono text-lg font-bold text-[#FFD600] tabular-nums">
                          ${tier.targetVolumeUsd.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-zinc-400">{tier.summary}</p>

                    <dl className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-zinc-300">
                        <dt className="text-zinc-500">Maker Wallets</dt>
                        <dd className="font-mono tabular-nums">
                          {tier.makersCount.toLocaleString('en-US')}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <dt className="text-zinc-500">Execution Cycle</dt>
                        <dd className="font-mono tabular-nums">{tier.cycleDuration}</dd>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <dt className="text-zinc-500">Routing</dt>
                        <dd className="text-right text-zinc-300">{tier.dexRouting}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onDepositWithTier(tier)}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600] ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFD600] text-[#07080A]'
                          : 'bg-[#1A1E29] text-white hover:bg-[#FF6B00] hover:text-[#07080A]'
                      }`}
                    >
                      <span>Deposit ${tier.depositUsd.toLocaleString('en-US')}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTierForBot(tier)}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#FFD600]" aria-hidden="true" />}
                      <span>{isSelected ? 'Loaded in Bot' : 'Load into Bot'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0E1015]">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs font-medium text-zinc-400">
                  <th className="px-5 py-3.5">Option</th>
                  <th className="px-5 py-3.5">Package Tier</th>
                  <th className="px-5 py-3.5 text-right">USD Deposit</th>
                  <th className="px-5 py-3.5 text-right">Target Volume</th>
                  <th className="px-5 py-3.5 text-right">Multiplier</th>
                  <th className="px-5 py-3.5 text-right">Maker Wallets</th>
                  <th className="px-5 py-3.5">Cycle Duration</th>
                  <th className="px-5 py-3.5">DEX Routing</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {DEPOSIT_TIERS.map((tier) => {
                  const isSelected = tier.id === selectedTierId;
                  return (
                    <tr
                      key={tier.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#171A24]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-zinc-400 tabular-nums">
                        {String(tier.tierNumber).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-white">{tier.name}</div>
                        <div className="text-xs text-zinc-500">{tier.targetAudience}</div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-white tabular-nums">
                        ${tier.depositUsd.toLocaleString('en-US')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-[#FFD600] tabular-nums">
                        ${tier.targetVolumeUsd.toLocaleString('en-US')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-[#FF6B00] tabular-nums">
                        {tier.multiplierLabel}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-300 tabular-nums">
                        {tier.makersCount.toLocaleString('en-US')}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-zinc-300 tabular-nums">
                        {tier.cycleDuration}
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-300">{tier.dexRouting}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDepositWithTier(tier)}
                          className="inline-flex items-center gap-1 rounded-md bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-[#07080A] hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Select &amp; Deposit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
