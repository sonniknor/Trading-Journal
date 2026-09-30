'use client';

import { useState } from 'react';
import { Trade } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Image as ImageIcon, Star, Activity, Clock, X, Upload } from 'lucide-react';
import Link from 'next/link';

export default function PlaybookClient({ trades }: { trades: Trade[] }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  if (trades.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Playbook is empty</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          You haven't graded any trades as "A" yet. Go to the Journal and mark your best setups as "A" to build your playbook.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trades.map((trade) => (
          <div 
            key={trade.id} 
            onClick={() => setSelectedTrade(trade)}
            className="glass-panel rounded-2xl overflow-hidden hover-lift group flex flex-col cursor-pointer"
          >
          {/* Image Placeholder / Actual Image */}
          <div className="h-48 bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-white/5">
            {trade.screenshots ? (
              // If we had image upload, we'd render it here
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trade.screenshots} alt="Setup" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-center text-gray-500 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto opacity-50" />
                <p className="text-xs">Missing Image</p>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-yellow-400 flex items-center gap-1 border border-yellow-500/20">
                <Star className="w-3 h-3 fill-yellow-400" /> A-Setup
              </span>
              <span className={`px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold border ${trade.pnl >= 0 ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}>
                ${trade.pnl.toFixed(2)}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-white border border-white/10">
                {trade.symbol}
              </span>
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{trade.setup || 'Unknown Setup'}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {format(new Date(trade.entryTime), 'MMM d, yyyy, HH:mm', { locale: enUS })}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {trade.direction}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {trade.session && <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300">Session: {trade.session}</span>}
              {trade.htfBias && <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300">Bias: {trade.htfBias}</span>}
              {trade.smtType && <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300">SMT: {trade.smtType}</span>}
            </div>

            {trade.notes && (
              <div className="mt-auto bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-sm text-gray-300 italic">&quot;{trade.notes}&quot;</p>
              </div>
            )}
          </div>
          </div>
        ))}
      </div>

      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 max-h-full min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> 
                A-Setup Details
              </h3>
              <button onClick={() => setSelectedTrade(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
              <div className="p-6 space-y-6">
                {/* Screenshot */}
                <div className="rounded-xl overflow-hidden bg-black/50 border border-white/5">
                  {selectedTrade.screenshots ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedTrade.screenshots} alt="Trade Screenshot" className="w-full h-auto object-cover" />
                  ) : (
                    <div className="p-10 text-center text-gray-500">
                      <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No screenshot uploaded</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                    <p className="font-mono text-white">{selectedTrade.entryPrice}</p>
                  </div>
                  <Activity className="w-5 h-5 text-gray-500 my-auto" />
                  <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Exit Price</p>
                    <p className="font-mono text-white">{selectedTrade.exitPrice}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Symbol" value={selectedTrade.symbol} />
                  <StatBox label="Direction" value={selectedTrade.direction} />
                  <StatBox label="Setup" value={selectedTrade.setup || '-'} />
                  <StatBox label="Session" value={selectedTrade.session || '-'} />
                  <StatBox label="Timeframe" value={selectedTrade.timeframe || '-'} />
                  <StatBox label="Account Type" value={selectedTrade.accountType || '-'} />
                  <StatBox label="HTF Bias" value={selectedTrade.htfBias || '-'} />
                  <StatBox label="SMT" value={selectedTrade.smtType || '-'} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Planned R:R" value={selectedTrade.plannedRr ? selectedTrade.plannedRr.toString() : '-'} />
                  <StatBox label="Result R:R" value={selectedTrade.resultRr ? selectedTrade.resultRr.toString() : '-'} />
                  <StatBox label="MFE" value={selectedTrade.mfe ? selectedTrade.mfe.toString() : '-'} />
                  <StatBox label="MAE" value={selectedTrade.mae ? selectedTrade.mae.toString() : '-'} />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase">Analysis & Notes</h4>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Emotional State</span>
                      <p className="text-sm text-white font-medium">{selectedTrade.emotionalState || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Rules Followed?</span>
                      <p className="text-sm text-white font-medium">{selectedTrade.rulesFollowed ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    {!selectedTrade.rulesFollowed && selectedTrade.ruleBroken && (
                      <div>
                        <span className="text-xs text-gray-500 text-red-400">Rule Broken</span>
                        <p className="text-sm text-white font-medium">{selectedTrade.ruleBroken}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-gray-500">Notes</span>
                      <p className="text-sm text-white whitespace-pre-wrap">{selectedTrade.notes || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end shrink-0">
              <Link href="/journal" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg">
                Go to Journal for full details &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
      <p className="font-semibold text-white mt-1">{value}</p>
    </div>
  );
}
