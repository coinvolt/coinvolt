import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Square,
  Wallet,
  Zap,
} from 'lucide-react';
import { CHAIN_NETWORKS, DEPOSIT_TIERS, MEME_TOKEN_PRESETS } from '../data/plans';
import {
  BotCampaign,
  ChainId,
  DepositRecord,
  DepositTier,
  ExecutionTrade,
  StrategyMode,
} from '../types/coinvolt';
import { VolumeChart } from './VolumeChart';

interface DashboardWorkspaceProps {
  accountBalanceUsd: number;
  connectedWallet: string | null;
  selectedTierId: string;
  campaigns: BotCampaign[];
  trades: ExecutionTrade[];
  deposits: DepositRecord[];
  onSelectTierId: (tierId: string) => void;
  onToggleWallet: () => void;
  onOpenDeposit: (tierId?: string) => void;
  onLaunchCampaign: (config: {
    chainId: ChainId;
    tokenSymbol: string;
    tokenName: string;
    contractAddress: string;
    tier: DepositTier;
    strategyMode: StrategyMode;
    buyRatio: number;
    mevProtection: boolean;
  }) => void;
  onToggleCampaignStatus: (campaignId: string) => void;
  onCompleteCampaign: (campaignId: string) => void;
}

export function DashboardWorkspace({
  accountBalanceUsd,
  connectedWallet,
  selectedTierId,
  campaigns,
  trades,
  deposits,
  onSelectTierId,
  onToggleWallet,
  onOpenDeposit,
  onLaunchCampaign,
  onToggleCampaignStatus,
  onCompleteCampaign,
}: DashboardWorkspaceProps) {
  const [chainId, setChainId] = useState<ChainId>('solana');
  const [tokenSymbol, setTokenSymbol] = useState('VOLTDOG');
  const [tokenName, setTokenName] = useState('Volt Inu Meme');
  const [contractAddress, setContractAddress] = useState(
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
  );
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('balanced');
  const [buyRatio, setBuyRatio] = useState(65);
  const [mevProtection, setMevProtection] = useState(true);
  const [formError, setFormError] = useState('');
  const [launchNotice, setLaunchNotice] = useState('');

  const [chartTimeframe, setChartTimeframe] = useState<'1H' | '6H' | '24H'>('24H');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'feed' | 'deposits'>('campaigns');
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const selectedTier =
    DEPOSIT_TIERS.find((t) => t.id === selectedTierId) ?? DEPOSIT_TIERS[0];
  const selectedChain =
    CHAIN_NETWORKS.find((c) => c.id === chainId) ?? CHAIN_NETWORKS[0];

  const totalDepositedUsd = deposits
    .filter((d) => d.status === 'Confirmed')
    .reduce((sum, d) => sum + d.amountUsd, 0);
  const totalGeneratedUsd = campaigns.reduce((sum, c) => sum + c.generatedVolumeUsd, 0);
  const totalTargetUsd = campaigns.reduce((sum, c) => sum + c.targetVolumeUsd, 0);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (tradeFilter !== 'ALL' && t.side !== tradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          t.tokenSymbol.toLowerCase().includes(q) ||
          t.makerWallet.toLowerCase().includes(q) ||
          t.txHash.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trades, tradeFilter, searchQuery]);

  const handleApplyPreset = (symbol: string) => {
    const preset = MEME_TOKEN_PRESETS.find((p) => p.symbol === symbol);
    if (!preset) return;
    setChainId(preset.chainId);
    setTokenSymbol(preset.symbol);
    setTokenName(preset.name);
    setContractAddress(preset.contractAddress);
    setFormError('');
  };

  const handleSubmitLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLaunchNotice('');

    if (contractAddress.trim().length < 12) {
      setFormError('Enter a valid meme coin contract address (minimum 12 characters).');
      return;
    }
    if (tokenSymbol.trim().length < 2) {
      setFormError('Enter a valid token ticker symbol (e.g., PEPE, WIF, VOLTDOG).');
      return;
    }

    if (accountBalanceUsd < selectedTier.depositUsd) {
      onOpenDeposit(selectedTier.id);
      return;
    }

    onLaunchCampaign({
      chainId,
      tokenSymbol: tokenSymbol.trim().toUpperCase(),
      tokenName: tokenName.trim() || `${tokenSymbol.trim().toUpperCase()} Token`,
      contractAddress: contractAddress.trim(),
      tier: selectedTier,
      strategyMode,
      buyRatio,
      mevProtection,
    });

    setLaunchNotice(
      `Volume Increase Bot started for $${tokenSymbol.trim().toUpperCase()} targeting $${selectedTier.targetVolumeUsd.toLocaleString('en-US')} volume.`
    );
    setActiveTab('campaigns');
  };

  const handleCopyHash = async (id: string, txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
    } catch {
      // Clipboard fallback ignored
    }
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 1500);
  };

  const hasEnoughBalance = accountBalanceUsd >= selectedTier.depositUsd;

  return (
    <section id="bot" className="bg-[#07080A] py-14">
      <div id="dashboard" className="mx-auto max-w-[1380px] px-6">
        {/* Workspace Header + Account Balance Controls */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#FF6B00] uppercase">
              Execution Terminal &amp; Campaign Analytics
            </p>
            <h2 className="mt-1.5 font-[Outfit] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Volume Increase Bot Dashboard
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-white/[0.08] bg-[#0E1015] px-4 py-2">
              <span className="block text-[11px] text-zinc-400">Available Vault Balance</span>
              <span className="font-mono text-base font-bold text-[#FFD600] tabular-nums">
                ${accountBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleWallet}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0E1015] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-colors hover:border-[#FF6B00] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wallet className="h-4 w-4 text-[#FF6B00]" aria-hidden="true" />
              <span className="font-mono">
                {connectedWallet ? connectedWallet : 'Connect Wallet'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDeposit(selectedTier.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-xs font-semibold text-[#07080A] transition-colors hover:bg-[#FF8524] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] p-4">
            <p className="text-xs text-zinc-400">Total Deposited Capital</p>
            <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
              ${totalDepositedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {deposits.length} verified deposit{deposits.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] p-4">
            <p className="text-xs text-zinc-400">Generated Bot Volume</p>
            <p className="mt-1 font-mono text-xl font-bold text-[#FFD600] tabular-nums">
              ${Math.round(totalGeneratedUsd).toLocaleString('en-US')}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Target quota: ${totalTargetUsd.toLocaleString('en-US')}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] p-4">
            <p className="text-xs text-zinc-400">Active Maker Wallets</p>
            <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
              {campaigns
                .reduce((sum, c) => sum + c.makersDeployed, 0)
                .toLocaleString('en-US')}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Rotated non-custodial wallets</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] p-4">
            <p className="text-xs text-zinc-400">Executed DEX Swaps</p>
            <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
              {campaigns
                .reduce((sum, c) => sum + c.tradesCount, 0)
                .toLocaleString('en-US')}
            </p>
            <p className="mt-1 text-xs text-[#FF6B00]">MEV-protected order routing</p>
          </div>
        </div>

        {/* Main 2-Column Workspace Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (5 cols): Volume Increase Bot Configurator */}
          <form
            onSubmit={handleSubmitLaunch}
            className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0E1015] p-6 lg:col-span-5"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div>
                  <h3 className="font-[Outfit] text-lg font-semibold text-white">
                    Configure Volume Increase Bot
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Target meme token parameters &amp; deposit package
                  </p>
                </div>
                <Zap className="h-5 w-5 text-[#FFD600]" aria-hidden="true" />
              </div>

              {/* Quick Token Presets */}
              <div>
                <span className="block text-xs font-medium text-zinc-400">
                  Quick Load Meme Pair
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MEME_TOKEN_PRESETS.map((preset) => (
                    <button
                      key={preset.symbol}
                      type="button"
                      onClick={() => handleApplyPreset(preset.symbol)}
                      className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        tokenSymbol === preset.symbol
                          ? 'border-[#FF6B00] bg-[#1D150D] text-[#FFD600]'
                          : 'border-white/10 bg-[#07080A] text-zinc-300 hover:border-white/25'
                      }`}
                    >
                      ${preset.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <label htmlFor="bot-chain-select" className="block text-xs font-medium text-zinc-300">
                  Blockchain &amp; DEX Venue
                </label>
                <select
                  id="bot-chain-select"
                  value={chainId}
                  onChange={(e) => {
                    const nextChain = e.target.value as ChainId;
                    setChainId(nextChain);
                    const net = CHAIN_NETWORKS.find((n) => n.id === nextChain);
                    if (net) setContractAddress(net.sampleAddress);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3.5 py-2.5 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
                >
                  {CHAIN_NETWORKS.map((net) => (
                    <option key={net.id} value={net.id}>
                      {net.name} — {net.primaryDex} (Avg {net.avgConfirmation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contract Address & Symbol */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor="bot-contract-input" className="block text-xs font-medium text-zinc-300">
                    Token Contract Address
                  </label>
                  <input
                    id="bot-contract-input"
                    type="text"
                    value={contractAddress}
                    onChange={(e) => {
                      setContractAddress(e.target.value);
                      setFormError('');
                    }}
                    placeholder="Paste meme coin contract address"
                    className="mt-1.5 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3 py-2.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="bot-symbol-input" className="block text-xs font-medium text-zinc-300">
                    Token Ticker
                  </label>
                  <input
                    id="bot-symbol-input"
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => {
                      setTokenSymbol(e.target.value);
                      setFormError('');
                    }}
                    placeholder="PEPE"
                    className="mt-1.5 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3 py-2.5 font-mono text-xs uppercase text-white placeholder:text-zinc-500 focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              {/* 10 Deposit Options Selector */}
              <div>
                <label htmlFor="bot-tier-select" className="block text-xs font-medium text-zinc-300">
                  Deposit Package (10 Volume Options)
                </label>
                <select
                  id="bot-tier-select"
                  value={selectedTier.id}
                  onChange={(e) => onSelectTierId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3.5 py-2.5 font-mono text-xs text-white focus:border-[#FF6B00] focus:outline-none"
                >
                  {DEPOSIT_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      Option {String(tier.tierNumber).padStart(2, '0')} · ${tier.depositUsd.toLocaleString('en-US')} Deposit → ${tier.targetVolumeUsd.toLocaleString('en-US')} Volume ({tier.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Strategy Cadence Tabs */}
              <div>
                <span className="block text-xs font-medium text-zinc-300">
                  Order Execution Cadence
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border border-white/[0.08] bg-[#07080A] p-1">
                  {(
                    [
                      { id: 'organic', label: 'Organic' },
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'surge', label: 'High Surge' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setStrategyMode(mode.id)}
                      className={`rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        strategyMode === mode.id
                          ? 'bg-[#FF6B00] text-[#07080A] font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buy/Sell Ratio Slider */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Buy / Sell Order Pressure</span>
                  <span className="font-mono text-[#FFD600] tabular-nums">
                    {buyRatio}% Buy / {100 - buyRatio}% Sell
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={85}
                  value={buyRatio}
                  onChange={(e) => setBuyRatio(Number(e.target.value))}
                  aria-label="Buy versus sell order pressure percentage"
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-[#FF6B00]"
                />
              </div>

              {/* MEV Protection Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#07080A] px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#FF6B00]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-white">MEV &amp; Sandwich Protection</p>
                    <p className="text-[11px] text-zinc-500">
                      Private RPC bundle routing on {selectedChain.primaryDex}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={mevProtection}
                  onClick={() => setMevProtection((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors ${
                    mevProtection
                      ? 'border-[#FF6B00] bg-[#FF6B00]'
                      : 'border-white/20 bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#07080A] transition-transform ${
                      mevProtection ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Summary & Submit Action */}
            <div className="mt-6 border-t border-white/[0.08] pt-5">
              <div className="mb-4 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Deposit Required:{' '}
                  <strong className="font-mono text-white tabular-nums">
                    ${selectedTier.depositUsd.toLocaleString('en-US')}
                  </strong>
                </span>
                <span className="text-zinc-400">
                  Target Output:{' '}
                  <strong className="font-mono text-[#FFD600] tabular-nums">
                    ${selectedTier.targetVolumeUsd.toLocaleString('en-US')}
                  </strong>
                </span>
              </div>

              {formError && (
                <p className="mb-3 rounded-lg border border-[#FF2E2E]/40 bg-[#FF2E2E]/10 px-3 py-2 text-xs text-[#FF6B6B]">
                  {formError}
                </p>
              )}

              {launchNotice && (
                <p className="mb-3 rounded-lg border border-[#FFD600]/30 bg-[#FFD600]/10 px-3 py-2 text-xs text-[#FFD600]">
                  {launchNotice}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFD600] px-5 py-3 text-sm font-bold text-[#07080A] shadow-[0_0_24px_rgba(255,107,0,0.28)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                <span>
                  {hasEnoughBalance
                    ? `Start Volume Increase Bot ($${selectedTier.depositUsd})`
                    : `Deposit $${selectedTier.depositUsd} & Launch Bot`}
                </span>
              </button>
            </div>
          </form>

          {/* Right Column (7 cols): Volume Chart + Tabbed Operational Tables */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <VolumeChart
              campaigns={campaigns}
              timeframe={chartTimeframe}
              onTimeframeChange={setChartTimeframe}
            />

            {/* Tabbed Operations Panel */}
            <div className="flex-1 rounded-xl border border-white/[0.08] bg-[#0E1015]">
              <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1 rounded-lg bg-[#07080A] p-1" role="tablist">
                  {(
                    [
                      { id: 'campaigns', label: `Active Bots (${campaigns.length})` },
                      { id: 'feed', label: `Live DEX Feed (${trades.length})` },
                      { id: 'deposits', label: `Deposits (${deposits.length})` },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#FF6B00] text-[#07080A] font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'feed' && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter token or wallet"
                        aria-label="Filter live execution feed"
                        className="w-40 rounded-md border border-white/10 bg-[#07080A] py-1.5 pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#FF6B00] focus:outline-none"
                      />
                    </div>
                    <div className="inline-flex rounded-md border border-white/10 bg-[#07080A] p-0.5">
                      {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setTradeFilter(side)}
                          className={`rounded px-2 py-1 text-[11px] font-medium cursor-pointer ${
                            tradeFilter === side
                              ? 'bg-zinc-800 text-white'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 1: Active Bot Campaigns */}
              {activeTab === 'campaigns' && (
                <div className="p-5">
                  {campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center">
                      <p className="text-sm font-medium text-white">
                        No Active Volume Campaigns
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-zinc-400">
                        Select one of the 10 deposit options and configure your meme coin address on the left to deploy your first Volume Increase Bot.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenDeposit(selectedTier.id)}
                        className="mt-4 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-[#07080A] hover:brightness-110 cursor-pointer"
                      >
                        Deposit Funds to Start
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns.map((camp) => {
                        const pct = Math.min(
                          100,
                          Math.round((camp.generatedVolumeUsd / camp.targetVolumeUsd) * 100)
                        );
                        return (
                          <div
                            key={camp.id}
                            className="rounded-lg border border-white/[0.08] bg-[#07080A] p-4"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div>
                                <div className="flex items-center gap-2.5 text-sm">
                                  <span className="font-mono font-bold text-white">
                                    ${camp.tokenSymbol}
                                  </span>
                                  <span className="text-zinc-500" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-xs text-zinc-400">{camp.dexName}</span>
                                  <span className="text-zinc-500" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-xs font-medium text-[#FF6B00]">
                                    {camp.tierName}
                                  </span>
                                </div>
                                <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                                  {camp.contractAddress.slice(0, 10)}...{camp.contractAddress.slice(-6)} · Started {camp.startedAt}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-mono text-xs font-medium ${
                                    camp.status === 'Running'
                                      ? 'text-[#FFD600]'
                                      : camp.status === 'Paused'
                                        ? 'text-zinc-400'
                                        : 'text-emerald-400'
                                  }`}
                                >
                                  Status: {camp.status}
                                </span>

                                {camp.status !== 'Completed' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onToggleCampaignStatus(camp.id)}
                                      aria-label={
                                        camp.status === 'Running' ? 'Pause bot' : 'Resume bot'
                                      }
                                      className="inline-flex items-center gap-1 rounded border border-white/15 bg-[#0E1015] px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-[#FF6B00] cursor-pointer"
                                    >
                                      {camp.status === 'Running' ? (
                                        <>
                                          <Pause className="h-3 w-3" aria-hidden="true" />
                                          <span>Pause</span>
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-3 w-3" aria-hidden="true" />
                                          <span>Resume</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onCompleteCampaign(camp.id)}
                                      aria-label="Stop campaign"
                                      className="inline-flex items-center gap-1 rounded border border-white/15 bg-[#0E1015] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-[#FF2E2E] hover:text-[#FF2E2E] cursor-pointer"
                                    >
                                      <Square className="h-3 w-3" aria-hidden="true" />
                                      <span>Stop</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Volume Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-zinc-300 tabular-nums">
                                  ${Math.round(camp.generatedVolumeUsd).toLocaleString('en-US')} / $
                                  {camp.targetVolumeUsd.toLocaleString('en-US')} Target
                                </span>
                                <span className="font-mono text-[#FFD600] tabular-nums">
                                  {pct}% · {camp.makersDeployed}/{camp.targetMakers} Makers
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF2E2E] via-[#FF6B00] to-[#FFD600] transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Live DEX Execution Feed */}
              {activeTab === 'feed' && (
                <div className="overflow-x-auto">
                  {filteredTrades.length === 0 ? (
                    <div className="p-10 text-center text-xs text-zinc-400">
                      No matching swap executions found for the selected filter.
                    </div>
                  ) : (
                    <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-zinc-400">
                          <th className="px-4 py-3 font-medium">Token</th>
                          <th className="px-4 py-3 font-medium">Side</th>
                          <th className="px-4 py-3 text-right font-medium">Volume (USD)</th>
                          <th className="px-4 py-3 font-medium">Maker Wallet</th>
                          <th className="px-4 py-3 font-medium">TX Hash</th>
                          <th className="px-4 py-3 text-right font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {filteredTrades.slice(0, 12).map((trade) => (
                          <tr key={trade.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 font-mono font-semibold text-white">
                              ${trade.tokenSymbol}
                            </td>
                            <td className="px-4 py-2.5 font-mono font-semibold">
                              <span
                                className={
                                  trade.side === 'BUY' ? 'text-[#FFD600]' : 'text-[#FF2E2E]'
                                }
                              >
                                {trade.side}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-zinc-200 tabular-nums">
                              ${trade.amountUsd.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-zinc-400">
                              {trade.makerWallet}
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => handleCopyHash(trade.id, trade.txHash)}
                                className="inline-flex items-center gap-1 font-mono text-zinc-400 hover:text-[#FF6B00] cursor-pointer"
                              >
                                <span>{trade.txHash.slice(0, 10)}...</span>
                                {copiedTxId === trade.id ? (
                                  <Check className="h-3 w-3 text-[#FFD600]" aria-hidden="true" />
                                ) : (
                                  <Copy className="h-3 w-3" aria-hidden="true" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-zinc-500 tabular-nums">
                              {trade.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Deposit Ledger */}
              {activeTab === 'deposits' && (
                <div className="overflow-x-auto">
                  {deposits.length === 0 ? (
                    <div className="p-10 text-center text-xs text-zinc-400">
                      No deposits recorded yet. Click &ldquo;Add Funds&rdquo; to fund your CoinVolt vault.
                    </div>
                  ) : (
                    <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-zinc-400">
                          <th className="px-4 py-3 font-medium">Tier</th>
                          <th className="px-4 py-3 font-medium">Payment Asset</th>
                          <th className="px-4 py-3 text-right font-medium">Amount (USD)</th>
                          <th className="px-4 py-3 font-medium">Reference</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {deposits.map((dep) => (
                          <tr key={dep.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 font-medium text-white">{dep.tierName}</td>
                            <td className="px-4 py-2.5 text-zinc-300">{dep.assetLabel}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#FFD600] tabular-nums">
                              +${dep.amountUsd.toLocaleString('en-US')}.00
                            </td>
                            <td className="px-4 py-2.5 font-mono text-zinc-400">
                              {dep.txReference.slice(0, 14)}...
                            </td>
                            <td
                              className={`px-4 py-2.5 font-medium ${
                                dep.status === 'Confirmed'
                                  ? 'text-emerald-400'
                                  : dep.status === 'Try Again'
                                    ? 'text-[#FF2E2E]'
                                    : 'text-[#FFD600]'
                              }`}
                            >
                              {dep.status === 'Pending' ? 'Pending (Wait 2 min)' : dep.status}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-zinc-500 tabular-nums">
                              {dep.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
