
'use client';

import { ShieldCheck, Search, AlertTriangle, ThermometerSnowflake, FileWarning } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import ScannerModal from '@/components/ScannerModal';

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-green-500/30">
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

      {/* 1. Navbar */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">RebateGuard</span>
          </div>
          {/* Login button removed as requested */}
        </div>
      </nav>

      <main className="pt-16">
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl">
            Stop Losing Money on <span className="text-green-400">Rejected HVAC Rebates</span>.
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Instantly verify Enbridge & CleanBC eligibility for heat pumps. Generate compliant certificates in 30 seconds.
          </p>

          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full group bg-green-600 hover:bg-green-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-green-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Search className="w-6 h-6" />
              <span>Check Eligibility Now - Free</span>
            </button>
            <p className="text-sm text-slate-400 font-medium">
              Trusted by 50+ Ontario Contractors. Official NRCan Data.
            </p>
          </div>
        </section>

        {/* 3. The "Pain" Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 text-amber-500">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The Coil Mismatch</h3>
              <p className="text-slate-400 leading-relaxed">
                One wrong indoor coil can drop your SEER2 rating below the limit. We catch it before you quote.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 text-blue-400">
                <ThermometerSnowflake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cold Climate Traps</h3>
              <p className="text-slate-400 leading-relaxed">
                Not all "Heat Pumps" handle -15°C. We flag non-compliant units instantly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 text-red-400">
                <FileWarning className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Paperwork Errors</h3>
              <p className="text-slate-400 leading-relaxed">
                Don't let a typo cost you $5,000. Generate audit-proof PDF certificates automatically.
              </p>
            </div>
          </div>
        </section>

        {/* 4. The "Trust" Banner */}
        <section className="w-full bg-slate-950 py-8 border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 font-medium text-lg">
              Data synced daily with <span className="text-slate-200">Natural Resources Canada</span> and <span className="text-slate-200">AHRI Directory</span>.
            </p>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="bg-slate-900 py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <p>&copy; 2025 RebateGuard. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
