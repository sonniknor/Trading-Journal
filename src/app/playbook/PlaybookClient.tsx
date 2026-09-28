'use client';

import { Trade } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Image as ImageIcon, Star, Activity, Clock } from 'lucide-react';

export default function PlaybookClient({ trades }: { trades: Trade[] }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trades.map((trade) => (
        <div key={trade.id} className="glass-panel rounded-2xl overflow-hidden hover-lift group flex flex-col">
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
  );
}
