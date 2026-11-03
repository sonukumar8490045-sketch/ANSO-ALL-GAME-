import React from 'react';
import { Gamepad2, ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-16 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4">
        {/* Brand & Value Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="font-cyber font-black text-white text-base">FUTURE FUSION GAMES</span>
            </div>
            <p className="font-tech text-xs text-slate-400 leading-relaxed max-w-md">
              The premier next-generation 3D futuristic gaming & casino-style entertainment platform. Powered by real-time WebGL, procedural audio synthesis, and interactive cyber simulation.
            </p>
          </div>

          <div>
            <h4 className="font-cyber text-xs font-bold text-white uppercase tracking-wider mb-3">
              GAME SUITES
            </h4>
            <ul className="space-y-2 font-tech text-xs">
              <li><span className="hover:text-cyan-400 cursor-pointer">3D Cyber Slots</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">3D Deep Sea Fishing</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">Cyber Roulette 2088</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">Neon Plinko Cascade</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">Mecha-Dragon Arena</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cyber text-xs font-bold text-white uppercase tracking-wider mb-3">
              SECURITY & FAIRNESS
            </h4>
            <ul className="space-y-2 font-tech text-xs">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Provably Fair Simulated RNG</span>
              </li>
              <li className="flex items-center gap-1.5 text-cyan-400">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>18+ Responsible Gaming</span>
              </li>
              <li><span>Self-Exclusion Tools</span></li>
              <li><span>Free Demo Coin Mode</span></li>
            </ul>
          </div>
        </div>

        {/* Legal & Regulatory Compliance Notice */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-tech text-slate-400 leading-relaxed mb-8">
          <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>IMPORTANT LEGAL & LICENSING COMPLIANCE NOTICE</span>
          </div>
          <p>
            FUTURE FUSION GAMES is an original futuristic gaming platform that utilizes virtual demo coins strictly for entertainment purposes. No real money can be won or lost. Any real-money deposit, withdrawal, or wagering functionality must be separately reviewed for applicable local laws, jurisdiction licensing, strict age verification (18+ / 21+), and approved payment-provider integrations.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs font-tech text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} FUTURE FUSION GAMES. All rights reserved. Designed for Web, iOS & Android.</div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-slate-300 cursor-pointer">RNG Certification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
