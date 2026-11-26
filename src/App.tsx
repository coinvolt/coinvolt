import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';
import { DashboardWorkspace } from './components/DashboardWorkspace';
import { DepositModal } from './components/DepositModal';
import { DepositPlansSection } from './components/DepositPlansSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ActiveSection, TopBar } from './components/TopBar';
import { CHAIN_NETWORKS } from './data/plans';
import {
  BotCampaign,
  ChainId,
  DepositRecord,
  DepositTier,
  ExecutionTrade,
  StrategyMode,
} from './types/coinvolt';

const STORAGE_KEY = 'coinvolt_terminal_state_v2';
const BASE_CUMULATIVE_VOLUME_USD = 5142830;
const MAX_LIVE_VOLUME_GAIN_USD = 10000;

const LIVE_MARKET_PAIRS: { symbol: string; chainId: ChainId; dexName: string }[] = [
  { symbol: 'PEPE', chainId: 'ethereum', dexName: 'Uniswap V3' },
  { symbol: 'BONK', chainId: 'solana', dexName: 'Raydium' },
  { symbol: 'BRETT', chainId: 'base', dexName: 'Aerodrome' },
  { symbol: 'FLOKI', chainId: 'bsc', dexName: 'PancakeSwap' },
  { symbol: 'WIF', chainId: 'solana', dexName: 'Raydium' },
];

interface PersistedState {
  accountBalanceUsd: number;
  connectedWallet: string | null;
  selectedTierId: string;
  campaigns: BotCampaign[];
  trades: ExecutionTrade[];
  deposits: DepositRecord[];
}

function randomWallet(chainId: ChainId): string {
  const hex = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  if (chainId === 'solana') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    const pick = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${pick(4)}...${pick(4)}`;
  }
  return `0x${hex()}...${hex()}`;
}

function randomTxHash(): string {
  return (
    '0x' +
    Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const DEFAULT_STATE: PersistedState = {
  accountBalanceUsd: 0,
  connectedWallet: null,
  selectedTierId: 'tier-01',
  campaigns: [],
  trades: [
    {
      id: 'tr-pub-1',
      campaignId: 'public-feed',
      tokenSymbol: 'PEPE',
      chainId: 'ethereum',
      dexName: 'Uniswap V3',
      makerWallet: '0x94A1...C82E',
      side: 'BUY',
      amountUsd: 46.2,
      txHash: '0x94a1f82e3b09c112',
      timestamp: formatNowTime(),
    },
    {
      id: 'tr-pub-2',
      campaignId: 'public-feed',
      tokenSymbol: 'WIF',
      chainId: 'solana',
      dexName: 'Raydium',
      makerWallet: '3rQw...8nLt',
      side: 'BUY',
      amountUsd: 58.9,
      txHash: '0x71c9d03b82e4a901',
      timestamp: formatNowTime(),
    },
    {
      id: 'tr-pub-3',
      campaignId: 'public-feed',
      tokenSymbol: 'BRETT',
      chainId: 'base',
      dexName: 'Aerodrome',
      makerWallet: '0x5F12...B31A',
      side: 'SELL',
      amountUsd: 31.4,
      txHash: '0x3e88b41c19f7d224',
      timestamp: formatNowTime(),
    },
  ],
  deposits: [],
};

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    if (typeof parsed.accountBalanceUsd !== 'number') return DEFAULT_STATE;
    return { ...parsed, accountBalanceUsd: 0 };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [platformLiveGainUsd, setPlatformLiveGainUsd] = useState<number>(0);
  const liveGainRef = useRef<number>(0);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [modalTierId, setModalTierId] = useState<string>(state.selectedTierId);
  const [pendingPopup, setPendingPopup] = useState<{
    depositId: string;
    tierId: string;
    amountUsd: number;
    assetLabel: string;
    txReference: string;
    secondsLeft: number;
    isVisible: boolean;
    phase: 'waiting' | 'try_again';
  } | null>(null);

  // 2-minute countdown: keeps available balance at $0 and re-opens popup with "Try Again" at 00:00
  useEffect(() => {
    if (!pendingPopup || pendingPopup.phase !== 'waiting') return;

    const timer = setInterval(() => {
      setPendingPopup((prev) => {
        if (!prev || prev.phase !== 'waiting') return prev;
        if (prev.secondsLeft <= 1) {
          return {
            ...prev,
            secondsLeft: 0,
            phase: 'try_again',
            isVisible: true,
          };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingPopup?.phase, pendingPopup?.depositId]);

  // Mark deposit ledger entry as "Try Again" and enforce zero balance when countdown expires
  useEffect(() => {
    if (!pendingPopup || pendingPopup.phase !== 'try_again') return;
    setState((prev) => ({
      ...prev,
      accountBalanceUsd: 0,
      deposits: prev.deposits.map((d) =>
        d.id === pendingPopup.depositId ? { ...d, status: 'Try Again' } : d
      ),
    }));
  }, [pendingPopup?.phase, pendingPopup?.depositId]);

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota ignored
    }
  }, [state]);

  // Every 5 seconds Cumulative Bot Volume ticker: gradually climbs up to +$10,000 then stops
  useEffect(() => {
    let tickCount = 0;
    const fiveSecondInterval = setInterval(() => {
      if (liveGainRef.current >= MAX_LIVE_VOLUME_GAIN_USD) {
        clearInterval(fiveSecondInterval);
        return;
      }

      tickCount += 1;
      const stepUsd = Math.floor(85 + Math.random() * 145);
      const nextGain = Math.min(MAX_LIVE_VOLUME_GAIN_USD, liveGainRef.current + stepUsd);
      liveGainRef.current = nextGain;
      setPlatformLiveGainUsd(nextGain);

      const pair =
        LIVE_MARKET_PAIRS[Math.floor(Math.random() * LIVE_MARKET_PAIRS.length)];
      const publicTrade: ExecutionTrade = {
        id: `tr-pub-${Date.now()}-${tickCount}`,
        campaignId: 'public-feed',
        tokenSymbol: pair.symbol,
        chainId: pair.chainId,
        dexName: pair.dexName,
        makerWallet: randomWallet(pair.chainId),
        side: Math.random() > 0.34 ? 'BUY' : 'SELL',
        amountUsd: Number((22 + Math.random() * 98).toFixed(2)),
        txHash: randomTxHash(),
        timestamp: formatNowTime(),
      };

      setState((prev) => ({
        ...prev,
        trades: [publicTrade, ...prev.trades].slice(0, 60),
      }));

      if (nextGain >= MAX_LIVE_VOLUME_GAIN_USD) {
        clearInterval(fiveSecondInterval);
      }
    }, 5000);

    return () => clearInterval(fiveSecondInterval);
  }, []);

  // Live execution simulation for Running Volume Increase Bot campaigns
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const running = prev.campaigns.filter((c) => c.status === 'Running');
        if (running.length === 0) return prev;

        const newTrades: ExecutionTrade[] = [];
        const updatedCampaigns = prev.campaigns.map((camp) => {
          if (camp.status !== 'Running') return camp;

          const stepScale =
            camp.strategyMode === 'surge' ? 0.025 : camp.strategyMode === 'balanced' ? 0.014 : 0.008;
          const swapSize = Math.max(
            8,
            Math.min(camp.targetVolumeUsd - camp.generatedVolumeUsd, camp.targetVolumeUsd * stepScale * (0.7 + Math.random() * 0.6))
          );

          const nextGenerated = Math.min(camp.targetVolumeUsd, camp.generatedVolumeUsd + swapSize);
          const reachedTarget = nextGenerated >= camp.targetVolumeUsd;
          const nextMakers = Math.min(
            camp.targetMakers,
            camp.makersDeployed + (Math.random() > 0.35 ? 1 : 0)
          );

          const isBuy = Math.random() * 100 < camp.buyRatio;
          newTrades.push({
            id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            campaignId: camp.id,
            tokenSymbol: camp.tokenSymbol,
            chainId: camp.chainId,
            dexName: camp.dexName.split('/')[0].trim(),
            makerWallet: randomWallet(camp.chainId),
            side: isBuy ? 'BUY' : 'SELL',
            amountUsd: Number(swapSize.toFixed(2)),
            txHash: randomTxHash(),
            timestamp: formatNowTime(),
          });

          return {
            ...camp,
            generatedVolumeUsd: nextGenerated,
            makersDeployed: nextMakers,
            tradesCount: camp.tradesCount + 1,
            status: reachedTarget ? ('Completed' as const) : ('Running' as const),
          };
        });

        return {
          ...prev,
          campaigns: updatedCampaigns,
          trades: [...newTrades, ...prev.trades].slice(0, 60),
        };
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenDeposit = (tierId?: string) => {
    setModalTierId(tierId ?? state.selectedTierId);
    setDepositModalOpen(true);
  };

  const handleSelectTierForBot = (tier: DepositTier) => {
    setState((prev) => ({ ...prev, selectedTierId: tier.id }));
    handleNavigate('bot');
  };

  const handleConfirmDeposit = ({
    tier,
    assetLabel,
    txReference,
    launchAfterDeposit,
  }: {
    tier: DepositTier;
    assetLabel: string;
    txReference: string;
    launchAfterDeposit: boolean;
  }) => {
    const depositId = `dep-${Date.now()}`;
    const newDeposit: DepositRecord = {
      id: depositId,
      tierId: tier.id,
      tierName: tier.name,
      amountUsd: tier.depositUsd,
      assetLabel,
      txReference,
      timestamp: formatNowTime(),
      status: 'Pending',
    };

    setState((prev) => ({
      ...prev,
      accountBalanceUsd: 0,
      selectedTierId: tier.id,
      deposits: [newDeposit, ...prev.deposits],
    }));

    setDepositModalOpen(false);
    setPendingPopup({
      depositId,
      tierId: tier.id,
      amountUsd: tier.depositUsd,
      assetLabel,
      txReference,
      secondsLeft: 120,
      isVisible: true,
      phase: 'waiting',
    });

    if (launchAfterDeposit) {
      handleNavigate('bot');
    }
  };

  const handleLaunchCampaign = ({
    chainId,
    tokenSymbol,
    tokenName,
    contractAddress,
    tier,
    strategyMode,
    buyRatio,
    mevProtection,
  }: {
    chainId: ChainId;
    tokenSymbol: string;
    tokenName: string;
    contractAddress: string;
    tier: DepositTier;
    strategyMode: StrategyMode;
    buyRatio: number;
    mevProtection: boolean;
  }) => {
    const chain = CHAIN_NETWORKS.find((c) => c.id === chainId) ?? CHAIN_NETWORKS[0];
    const initialSwap = Number((tier.targetVolumeUsd * 0.025).toFixed(2));
    const campId = `camp-${Date.now()}`;

    const newCampaign: BotCampaign = {
      id: campId,
      tokenSymbol,
      tokenName,
      contractAddress,
      chainId,
      dexName: chain.primaryDex,
      tierId: tier.id,
      tierName: tier.name,
      depositUsd: tier.depositUsd,
      targetVolumeUsd: tier.targetVolumeUsd,
      generatedVolumeUsd: initialSwap,
      makersDeployed: Math.max(4, Math.round(tier.makersCount * 0.04)),
      targetMakers: tier.makersCount,
      buyRatio,
      strategyMode,
      mevProtection,
      status: 'Running',
      startedAt: formatNowTime(),
      tradesCount: 1,
    };

    const firstTrade: ExecutionTrade = {
      id: `tr-${Date.now()}`,
      campaignId: campId,
      tokenSymbol,
      chainId,
      dexName: chain.primaryDex.split('/')[0].trim(),
      makerWallet: randomWallet(chainId),
      side: 'BUY',
      amountUsd: initialSwap,
      txHash: randomTxHash(),
      timestamp: formatNowTime(),
    };

    setState((prev) => ({
      ...prev,
      accountBalanceUsd: Math.max(0, prev.accountBalanceUsd - tier.depositUsd),
      campaigns: [newCampaign, ...prev.campaigns],
      trades: [firstTrade, ...prev.trades].slice(0, 60),
    }));
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => {
        if (c.id !== campaignId || c.status === 'Completed') return c;
        return {
          ...c,
          status: c.status === 'Running' ? 'Paused' : 'Running',
        };
      }),
    }));
  };

  const handleCompleteCampaign = (campaignId: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: 'Completed' } : c
      ),
    }));
  };

  const handleToggleWallet = () => {
    setState((prev) => ({
      ...prev,
      connectedWallet: prev.connectedWallet ? null : '7xK9...m4Qp',
    }));
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F4F4F6]">
      <TopBar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenDeposit={() => handleOpenDeposit(state.selectedTierId)}
      />

      <main>
        <HeroSection
          campaigns={state.campaigns}
          accountBalanceUsd={state.accountBalanceUsd}
          cumulativeVolumeUsd={BASE_CUMULATIVE_VOLUME_USD + platformLiveGainUsd}
          onStartBotClick={() => handleNavigate('bot')}
          onExplorePlansClick={() => handleNavigate('plans')}
        />

        <DepositPlansSection
          selectedTierId={state.selectedTierId}
          onSelectTierForBot={handleSelectTierForBot}
          onDepositWithTier={(tier) => handleOpenDeposit(tier.id)}
        />

        <DashboardWorkspace
          accountBalanceUsd={state.accountBalanceUsd}
          connectedWallet={state.connectedWallet}
          selectedTierId={state.selectedTierId}
          campaigns={state.campaigns}
          trades={state.trades}
          deposits={state.deposits}
          onSelectTierId={(tierId) =>
            setState((prev) => ({ ...prev, selectedTierId: tierId }))
          }
          onToggleWallet={handleToggleWallet}
          onOpenDeposit={handleOpenDeposit}
          onLaunchCampaign={handleLaunchCampaign}
          onToggleCampaignStatus={handleToggleCampaignStatus}
          onCompleteCampaign={handleCompleteCampaign}
        />
      </main>

      <Footer onNavigate={handleNavigate} />

      <DepositModal
        isOpen={depositModalOpen}
        initialTierId={modalTierId}
        onClose={() => setDepositModalOpen(false)}
        onConfirmDeposit={handleConfirmDeposit}
      />

      {pendingPopup && pendingPopup.isVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pending-deposit-title"
        >
          <div
            className={`w-full max-w-md rounded-xl border bg-[#0E1015] p-6 shadow-2xl ${
              pendingPopup.phase === 'try_again'
                ? 'border-[#FF2E2E]/60'
                : 'border-[#FF6B00]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    pendingPopup.phase === 'try_again'
                      ? 'border-[#FF2E2E]/40 bg-[#1D0D0F]'
                      : 'border-[#FF6B00]/40 bg-[#19140E]'
                  }`}
                >
                  {pendingPopup.phase === 'try_again' ? (
                    <AlertCircle className="h-5 w-5 text-[#FF2E2E]" aria-hidden="true" />
                  ) : (
                    <Clock className="h-5 w-5 text-[#FFD600]" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-medium tracking-wider uppercase ${
                      pendingPopup.phase === 'try_again'
                        ? 'text-[#FF2E2E]'
                        : 'text-[#FF6B00]'
                    }`}
                  >
                    {pendingPopup.phase === 'try_again'
                      ? 'Confirmation Timed Out'
                      : 'Verification Pending'}
                  </p>
                  <h3 id="pending-deposit-title" className="font-[Outfit] text-lg font-bold text-white">
                    {pendingPopup.phase === 'try_again'
                      ? 'Try Again'
                      : 'Wait 2 Min to Confirm'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPendingPopup((prev) =>
                    prev
                      ? prev.phase === 'try_again'
                        ? null
                        : { ...prev, isVisible: false }
                      : null
                  )
                }
                aria-label="Close confirmation popup"
                className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:border-white/25 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {pendingPopup.phase === 'try_again' ? (
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                No confirmed transfer was verified after 2 minutes. Please <strong className="text-white">try again</strong>. Your available vault balance remains{' '}
                <span className="font-mono font-semibold text-[#FFD600] tabular-nums">$0.00</span>.
              </p>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                Your deposit request has been submitted. Please wait <strong className="text-white">2 minutes</strong> for on-chain network confirmation. Your available balance remains{' '}
                <span className="font-mono font-semibold text-[#FFD600] tabular-nums">$0.00</span>.
              </p>
            )}

            <div className="mt-4 space-y-2 rounded-lg border border-white/[0.08] bg-[#07080A] p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Deposit Amount</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  ${pendingPopup.amountUsd.toLocaleString('en-US')}.00 USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Payment Network</span>
                <span className="text-zinc-200">{pendingPopup.assetLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Available Balance</span>
                <span className="font-mono font-semibold text-white tabular-nums">$0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {pendingPopup.phase === 'try_again' ? 'Status' : 'Estimated Confirmation'}
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    pendingPopup.phase === 'try_again' ? 'text-[#FF2E2E]' : 'text-[#FFD600]'
                  }`}
                >
                  {pendingPopup.phase === 'try_again'
                    ? 'Try Again'
                    : `${String(Math.floor(pendingPopup.secondsLeft / 60)).padStart(2, '0')}:${String(pendingPopup.secondsLeft % 60).padStart(2, '0')}`}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              {pendingPopup.phase === 'try_again' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPendingPopup(null)}
                    className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-[#14171F] px-4 py-2.5 text-xs font-semibold text-white hover:border-white/30 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const retryTierId = pendingPopup.tierId;
                      setPendingPopup(null);
                      handleOpenDeposit(retryTierId);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFD600] px-5 py-2.5 text-xs font-bold text-[#07080A] hover:brightness-110 cursor-pointer"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setPendingPopup((prev) => (prev ? { ...prev, isVisible: false } : null))
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFD600] px-5 py-2.5 text-xs font-bold text-[#07080A] hover:brightness-110 cursor-pointer"
                >
                  Okay, Got It
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
