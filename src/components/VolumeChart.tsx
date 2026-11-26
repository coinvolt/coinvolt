import { useMemo } from 'react';
import { BotCampaign } from '../types/coinvolt';

interface VolumeChartProps {
  campaigns: BotCampaign[];
  timeframe: '1H' | '6H' | '24H';
  onTimeframeChange: (tf: '1H' | '6H' | '24H') => void;
}

export function VolumeChart({ campaigns, timeframe, onTimeframeChange }: VolumeChartProps) {
  const totalGenerated = campaigns.reduce((sum, c) => sum + c.generatedVolumeUsd, 0);
  const totalTarget = campaigns.reduce((sum, c) => sum + c.targetVolumeUsd, 0);

  const bars = useMemo(() => {
    const count = 16;
    const baseScale = timeframe === '1H' ? 0.25 : timeframe === '6H' ? 0.6 : 1;
    const liveBoost = Math.max(200, totalGenerated);

    return Array.from({ length: count }, (_, i) => {
      const progressFactor = (i + 1) / count;
      const organicCurve = Math.sin(i * 0.55) * 0.18 + 0.45 + progressFactor * 0.45;
      const baseline = Math.round((140 + ((i * 37) % 110)) * baseScale);
      const botVolume = Math.round((liveBoost / count) * organicCurve * (0.75 + (i % 3) * 0.16));
      return {
        label:
          timeframe === '1H'
            ? `${(i + 1) * 4}m`
            : timeframe === '6H'
              ? `${Math.floor(((i + 1) * 22) / 60)}h`
              : `${String((i + 8) % 24).padStart(2, '0')}:00`,
        baseline,
        botVolume,
        total: baseline + botVolume,
      };
    });
  }, [timeframe, totalGenerated]);

  const maxTotal = Math.max(...bars.map((b) => b.total), 500);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-[Outfit] text-base font-semibold text-white">
            On-Chain Volume Progression
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#FF6B00]" aria-hidden="true" />
              Bot Boosted Volume
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-zinc-600" aria-hidden="true" />
              Organic Baseline
            </span>
            <span className="font-mono text-zinc-300 tabular-nums">
              Target Quota: ${totalTarget.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        <div
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#07080A] p-1 self-start sm:self-auto"
          role="tablist"
          aria-label="Chart timeframe"
        >
          {(['1H', '6H', '24H'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              role="tab"
              aria-selected={timeframe === tf}
              onClick={() => onTimeframeChange(tf)}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#FF6B00] text-[#07080A] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Column & Momentum Chart */}
      <div className="mt-5">
        <div className="relative h-52 w-full">
          <svg
            viewBox="0 0 640 200"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Volume progression bar chart"
          >
            <defs>
              <linearGradient id="cv-bar-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="55%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF2E2E" />
              </linearGradient>
            </defs>

            {/* Horizontal reference grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = 172 - step * 150;
              return (
                <g key={step}>
                  <line
                    x1="0"
                    y1={y}
                    x2="640"
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="0"
                    y={y - 4}
                    fill="#71717A"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ${Math.round(maxTotal * step).toLocaleString('en-US')}
                  </text>
                </g>
              );
            })}

            {bars.map((bar, idx) => {
              const x = 54 + idx * 36.5;
              const width = 22;
              const botHeight = Math.max(4, (bar.botVolume / maxTotal) * 145);
              const baseHeight = Math.max(3, (bar.baseline / maxTotal) * 145);
              const baseY = 172 - baseHeight;
              const botY = baseY - botHeight;

              return (
                <g key={bar.label + idx}>
                  <rect
                    x={x}
                    y={baseY}
                    width={width}
                    height={baseHeight}
                    rx="2"
                    fill="#3F3F46"
                  />
                  <rect
                    x={x}
                    y={botY}
                    width={width}
                    height={botHeight}
                    rx="2"
                    fill="url(#cv-bar-grad)"
                  />
                  {idx % 2 === 0 && (
                    <text
                      x={x + width / 2}
                      y="192"
                      textAnchor="middle"
                      fill="#71717A"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {bar.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
