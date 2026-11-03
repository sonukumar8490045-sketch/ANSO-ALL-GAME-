import React, { useState } from 'react';
import { Transaction } from '../../types';
import { sound } from '../../services/sound';
import { X, Wallet, ArrowDownCircle, ArrowUpCircle, ShieldCheck, History, Gift, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  vipPoints: number;
  transactions: Transaction[];
  onDepositCoins: (amount: number, description: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  vipPoints,
  transactions,
  onDepositCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history' | 'legal'>('deposit');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [customWithdrawAmount, setCustomWithdrawAmount] = useState<string>('5000');
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const demoPackages = [
    { coins: 10000, label: 'Starter Booster', bonus: '+2,000 BONUS', price: 'FREE DEMO' },
    { coins: 50000, label: 'Cyber Syndicate', bonus: '+15,000 BONUS', price: 'FREE DEMO', popular: true },
    { coins: 150000, label: 'High Roller VIP', bonus: '+50,000 BONUS', price: 'FREE DEMO' },
    { coins: 500000, label: 'Overlord Matrix Vault', bonus: '+200,000 BONUS', price: 'FREE DEMO' },
  ];

  const handleClaimDemoPackage = (amount: number, bonusText: string) => {
    sound.playWin(3);
    onDepositCoins(amount, `Demo Deposit: ${bonusText}`);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();

    if (code === 'FUSION2088' || code === 'CYBERVIP' || code === 'JACKPOT') {
      sound.playJackpot();
      const reward = 50000;
      onDepositCoins(reward, `Voucher Code: ${code}`);
      setPromoMessage(`✅ SUCCESS! Redeemed voucher "${code}" for +${reward.toLocaleString()} virtual coins!`);
      setPromoCode('');
      confetti({ particleCount: 90, spread: 70 });
    } else {
      sound.playUiClick();
      setPromoMessage('❌ Invalid voucher code. Try "FUSION2088" or "CYBERVIP" for demo coins.');
    }
  };

  const handleDemoWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customWithdrawAmount, 10);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > userCoins) {
      sound.playUiClick();
      return;
    }
    sound.playWin(2);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cyber text-lg font-bold text-white flex items-center gap-2">
                FUSION WALLET & TREASURY
              </h2>
              <span className="font-tech text-xs text-slate-400">DEMO CURRENCY VIRTUAL VAULT</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30">
              <span className="font-tech text-xs text-slate-400 uppercase tracking-wider block">
                VIRTUAL COIN BALANCE
              </span>
              <div className="font-cyber text-2xl font-black text-cyan-400 tabular-nums mt-1">
                {userCoins.toLocaleString()} <span className="text-xs text-cyan-200">COINS</span>
              </div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-purple-500/30">
              <span className="font-tech text-xs text-slate-400 uppercase tracking-wider block">
                VIP FUSION CREDITS
              </span>
              <div className="font-cyber text-2xl font-black text-purple-400 tabular-nums mt-1">
                {vipPoints.toLocaleString()} <span className="text-xs text-purple-200">PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          {[
            { id: 'deposit', label: 'DEMO RECHARGE', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'DEMO WITHDRAWAL', icon: ArrowUpCircle },
            { id: 'history', label: 'LEDGER HISTORY', icon: History },
            { id: 'legal', label: 'LEGAL & COMPLIANCE', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playUiClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 py-3 px-3 font-tech text-xs font-bold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-cyber text-xs font-bold text-white mb-2 uppercase">
                  INSTANT FREE DEMO COIN PACKAGES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demoPackages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition ${
                        pkg.popular
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-3 bg-cyan-400 text-slate-950 font-cyber font-bold text-[9px] px-2 py-0.5 rounded">
                          POPULAR
                        </span>
                      )}
                      <div>
                        <div className="font-cyber font-black text-lg text-white">
                          +{pkg.coins.toLocaleString()} COINS
                        </div>
                        <div className="font-tech text-xs font-bold text-yellow-400">{pkg.bonus}</div>
                        <div className="font-tech text-[11px] text-slate-400">{pkg.label}</div>
                      </div>
                      <button
                        onClick={() => handleClaimDemoPackage(pkg.coins, pkg.label)}
                        className="mt-3 w-full py-2 rounded-lg font-cyber text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                      >
                        CLAIM {pkg.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Code Form */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-cyber text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                  REDEEM PROMO / VOUCHER CODE
                </h4>
                <form onSubmit={handleRedeemCode} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. FUSION2088"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-tech text-white uppercase focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-cyber text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    REDEEM
                  </button>
                </form>
                {promoMessage && (
                  <p className="mt-2 text-xs font-tech text-cyan-300">{promoMessage}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div>
                <h4 className="font-cyber text-sm font-bold text-white">DEMO CASH-OUT SIMULATOR</h4>
                <p className="font-tech text-xs text-slate-400 mt-1">
                  Test the simulated payout pipeline. Withdrawals in demo mode transfer simulated virtual coins into your saved mock bank ledger.
                </p>
              </div>

              <form onSubmit={handleDemoWithdraw} className="space-y-3">
                <div>
                  <label className="text-xs font-tech text-slate-300 block mb-1">
                    WITHDRAWAL AMOUNT (COINS):
                  </label>
                  <input
                    type="number"
                    value={customWithdrawAmount}
                    onChange={(e) => setCustomWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-cyber text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-tech text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Simulated Method:</span>
                    <span className="text-white font-bold">Instant Cyber-Sepa / Crypto Rail (Mock)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="text-emerald-400 font-bold">0% (Demo Mode)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-cyber text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  SIMULATE WITHDRAWAL
                </button>
              </form>

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-400 rounded-lg text-xs font-tech text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulated withdrawal processed successfully! Demo coins reserved.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <h4 className="font-cyber text-xs font-bold text-white mb-2 uppercase">
                RECENT TRANSACTION LEDGER
              </h4>
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-tech text-xs font-bold text-white">{tx.gameTitle}</div>
                      <div className="font-tech text-[10px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleTimeString()} · {tx.type}
                      </div>
                    </div>
                    <div
                      className={`font-cyber text-xs font-bold tabular-nums ${
                        tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} COINS
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-cyber text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                REGULATORY & LICENSING COMPLIANCE STATEMENT
              </div>
              <p className="font-tech text-xs text-slate-300 leading-relaxed">
                FUTURE FUSION GAMES operates strictly as an entertainment and social gaming simulator utilizing virtual demo coins. No real-money wagering is conducted within this environment.
              </p>
              <p className="font-tech text-xs text-slate-400 leading-relaxed">
                Notice on Real-Money Functionality: Any real-money deposit, withdrawal, or wagering functionality must be separately reviewed for applicable local laws, jurisdictional gambling licensing, strict age verification (18+/21+), AML/KYC identity procedures, and certified payment-provider approval.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-tech text-cyan-400">
                ✓ Provably Fair Simulated RNG · Responsible Gaming Limits Active
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
