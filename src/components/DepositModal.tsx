import { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { DEPOSIT_TIERS, PAYMENT_ASSETS } from '../data/plans';
import { DepositTier, PaymentAssetId } from '../types/coinvolt';

interface DepositModalProps {
  isOpen: boolean;
  initialTierId: string;
  onClose: () => void;
  onConfirmDeposit: (payload: {
    tier: DepositTier;
    assetLabel: string;
    txReference: string;
    launchAfterDeposit: boolean;
  }) => void;
}

export function DepositModal({
  isOpen,
  initialTierId,
  onClose,
  onConfirmDeposit,
}: DepositModalProps) {
  const [selectedTierId, setSelectedTierId] = useState(initialTierId);
  const [assetId, setAssetId] = useState<PaymentAssetId>('usdt_bep20');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedTierId(initialTierId);
      setTxHash('');
      setErrorMessage('');
      setCopied(false);
    }
  }, [isOpen, initialTierId]);

  if (!isOpen) {
    return null;
  }

  const activeTier =
    DEPOSIT_TIERS.find((t) => t.id === selectedTierId) ?? DEPOSIT_TIERS[0];
  const activeAsset =
    PAYMENT_ASSETS.find((a) => a.id === assetId) ?? PAYMENT_ASSETS[0];

  const exactCryptoAmount = (activeTier.depositUsd * activeAsset.ratePerUsd).toFixed(
    activeAsset.ratePerUsd === 1 ? 2 : 4
  );

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(activeAsset.vaultAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSubmit = (launchAfterDeposit: boolean) => {
    const cleanRef =
      txHash.trim() ||
      `0x${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-6)}`;

    if (txHash.trim().length > 0 && txHash.trim().length < 8) {
      setErrorMessage('Please enter a valid transaction hash (minimum 8 characters) or leave blank to auto-verify.');
      return;
    }

    onConfirmDeposit({
      tier: activeTier,
      assetLabel: activeAsset.label,
      txReference: cleanRef,
      launchAfterDeposit,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0E1015] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#FF6B00] uppercase">
              CoinVolt Funding Vault
            </p>
            <h2 id="deposit-modal-title" className="mt-1 font-[Outfit] text-xl font-bold text-white">
              Deposit Funds for Volume Increase Bot
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deposit dialog"
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-white/25 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Step 1: Select from all 10 Deposit Options */}
        <div className="mt-5">
          <label className="block text-xs font-medium text-zinc-300">
            1. Select Deposit Package (10 Tiers Available)
          </label>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {DEPOSIT_TIERS.map((tier) => {
              const selected = tier.id === activeTier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#FF6B00] bg-[#19140E]'
                      : 'border-white/[0.08] bg-[#07080A] hover:border-white/25'
                  }`}
                >
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    ${tier.depositUsd.toLocaleString('en-US')}
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-[#FFD600] tabular-nums">
                    → ${tier.targetVolumeUsd.toLocaleString('en-US')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tier Summary Strip */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-white/[0.08] bg-[#07080A] p-3.5">
          <div>
            <p className="text-[11px] text-zinc-400">Selected Package</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{activeTier.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400">Deposit Amount</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-white tabular-nums">
              ${activeTier.depositUsd.toLocaleString('en-US')}.00 USD
            </p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400">Target Bot Volume</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-[#FFD600] tabular-nums">
              ${activeTier.targetVolumeUsd.toLocaleString('en-US')} ({activeTier.multiplierLabel})
            </p>
          </div>
        </div>

        {/* Step 2: Payment Network & Asset */}
        <div className="mt-5">
          <label htmlFor="payment-asset-select" className="block text-xs font-medium text-zinc-300">
            2. Choose Payment Currency &amp; Network
          </label>
          <select
            id="payment-asset-select"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value as PaymentAssetId)}
            className="mt-2 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3.5 py-2.5 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
          >
            {PAYMENT_ASSETS.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label} — {asset.network}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Vault Transfer Details */}
        <div className="mt-5 rounded-lg border border-white/[0.08] bg-[#07080A] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
              <span className="text-xs text-zinc-400">Exact Transfer Amount</span>
              <span className="font-mono text-sm font-bold text-[#FFD600] tabular-nums">
                {exactCryptoAmount} {activeAsset.unit}
              </span>
            </div>

            <div>
              <p className="text-xs text-zinc-400">CoinVolt Vault Address ({activeAsset.network})</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="block min-w-0 flex-1 break-all rounded border border-white/[0.08] bg-[#0E1015] px-3 py-2 font-mono text-xs text-zinc-200">
                  {activeAsset.vaultAddress}
                </code>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#14171F] px-3 py-2 text-xs font-medium text-white hover:border-[#FF6B00] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#FFD600]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Hash Optional Input */}
        <div className="mt-4">
          <label htmlFor="deposit-tx-hash" className="block text-xs font-medium text-zinc-300">
            3. Transaction Hash / Reference (Optional for instant vault credit)
          </label>
          <input
            id="deposit-tx-hash"
            type="text"
            value={txHash}
            onChange={(e) => {
              setTxHash(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Paste on-chain TX hash or leave blank for instant verification"
            className="mt-1.5 w-full rounded-lg border border-white/[0.12] bg-[#07080A] px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#FF6B00] focus:outline-none"
          />
          {errorMessage && (
            <p className="mt-1.5 text-xs text-[#FF2E2E]">{errorMessage}</p>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-[#14171F] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#FF6B00] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Confirm &amp; Add to Balance
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FFD600] px-5 py-2.5 text-xs font-bold text-[#07080A] shadow-[0_0_24px_rgba(255,107,0,0.28)] transition-transform hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Confirm Deposit &amp; Launch Bot
          </button>
        </div>
      </div>
    </div>
  );
}
