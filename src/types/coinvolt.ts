export type ChainId = 'solana' | 'ethereum' | 'base' | 'bsc';

export type StrategyMode = 'organic' | 'balanced' | 'surge';

export type PaymentAssetId = 'usdt_bep20' | 'sol_bep20' | 'usdt_trc20';

export interface DepositTier {
  id: string;
  tierNumber: number;
  name: string;
  targetAudience: string;
  depositUsd: number;
  targetVolumeUsd: number;
  multiplierLabel: string;
  makersCount: number;
  cycleDuration: string;
  dexRouting: string;
  summary: string;
  featured?: boolean;
}

export interface ChainNetwork {
  id: ChainId;
  name: string;
  shortName: string;
  primaryDex: string;
  avgConfirmation: string;
  sampleAddress: string;
}

export interface MemeTokenPreset {
  symbol: string;
  name: string;
  chainId: ChainId;
  contractAddress: string;
  dexPair: string;
  baseDailyVolumeUsd: number;
}

export interface BotCampaign {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  contractAddress: string;
  chainId: ChainId;
  dexName: string;
  tierId: string;
  tierName: string;
  depositUsd: number;
  targetVolumeUsd: number;
  generatedVolumeUsd: number;
  makersDeployed: number;
  targetMakers: number;
  buyRatio: number;
  strategyMode: StrategyMode;
  mevProtection: boolean;
  status: 'Running' | 'Paused' | 'Completed';
  startedAt: string;
  tradesCount: number;
}

export interface ExecutionTrade {
  id: string;
  campaignId: string;
  tokenSymbol: string;
  chainId: ChainId;
  dexName: string;
  makerWallet: string;
  side: 'BUY' | 'SELL';
  amountUsd: number;
  txHash: string;
  timestamp: string;
}

export interface DepositRecord {
  id: string;
  tierId: string;
  tierName: string;
  amountUsd: number;
  assetLabel: string;
  txReference: string;
  timestamp: string;
  status: 'Pending' | 'Try Again' | 'Confirmed';
}
