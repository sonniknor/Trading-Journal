'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trade } from '@prisma/client';
import { updateTrade } from '@/app/actions';
import { X, Save, ArrowRight, Activity, Clock } from 'lucide-react';

export default function JournalClient({ initialTrades }: { initialTrades: Trade[] }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTrade) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      setup: formData.get('setup') as string,
      timeframe: formData.get('timeframe') as string,
      htfBias: formData.get('htfBias') as string,
      smtType: formData.get('smtType') as string,
      session: formData.get('session') as string,
      grade: formData.get('grade') as string,
      emotionalState: formData.get('emotionalState') as string,
      notes: formData.get('notes') as string,
      newsCatalyst: formData.get('newsCatalyst') === 'on',
      rulesFollowed: formData.get('rulesFollowed') === 'on',
      ruleBroken: formData.get('ruleBroken') as string,
      plannedRr: formData.get('plannedRr') ? parseFloat(formData.get('plannedRr') as string) : null,
      resultRr: formData.get('resultRr') ? parseFloat(formData.get('resultRr') as string) : null,
      mfe: formData.get('mfe') ? parseInt(formData.get('mfe') as string, 10) : null,
      mae: formData.get('mae') ? parseInt(formData.get('mae') as string, 10) : null,
    };

    const result = await updateTrade(selectedTrade.id, data);
    if (result.success) {
      setTrades(trades.map(t => t.id === selectedTrade.id ? { ...t, ...data } : t));
      setSelectedTrade(null);
    } else {
      alert("Feil ved lagring av trade.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-150px)]">
      {/* Table Section */}
      <div className={`glass-panel rounded-2xl overflow-hidden flex-1 transition-all duration-300 flex flex-col ${selectedTrade ? 'w-2/3' : 'w-full'}`}>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm text-left relative">
            <thead className="text-xs text-gray-400 bg-white/5 uppercase sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Dato & Tid</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Retning</th>
                <th className="px-6 py-4">PnL</th>
                <th className="px-6 py-4">Setup</th>
                <th className="px-6 py-4">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trades.map((trade) => (
                <tr 
                  key={trade.id} 
                  onClick={() => setSelectedTrade(trade)}
                  className={`cursor-pointer transition-colors ${selectedTrade?.id === trade.id ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                >
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {format(new Date(trade.entryTime), 'dd. MMM HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold ${
                    trade.pnl >= 50 ? 'text-green-400' : 
                    trade.pnl <= -50 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    ${trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{trade.setup || '-'}</td>
                  <td className="px-6 py-4">
                    {trade.grade ? (
                      <span className="px-2 py-1 bg-white/10 rounded-md text-white font-bold">{trade.grade}</span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Ingen trades funnet. Gå til Opplasting for å importere.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel for Editing */}
      {selectedTrade && (
        <div className="w-1/3 glass-panel rounded-2xl flex flex-col animate-in">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Rediger Trade</h3>
            <button onClick={() => setSelectedTrade(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Entry Pris</p>
                <p className="font-mono text-white">{selectedTrade.entryPrice}</p>
              </div>
              <Activity className="w-5 h-5 text-gray-500 my-auto" />
              <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Exit Pris</p>
                <p className="font-mono text-white">{selectedTrade.exitPrice}</p>
              </div>
            </div>

            <form id="edit-trade-form" onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Timeframe</label>
                  <select name="timeframe" defaultValue={selectedTrade.timeframe || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Velg timeframe...</option>
                    <option value="4h/15m">4h / 15m</option>
                    <option value="1h/5m">1h / 5m</option>
                    <option value="30m/3m">30m / 3m</option>
                    <option value="15m/1m">15m / 1m</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Setup</label>
                  <select name="setup" defaultValue={selectedTrade.setup || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Velg setup...</option>
                    <option value="2022 Mentorship">2022 Mentorship</option>
                    <option value="Silver Bullet">Silver Bullet</option>
                    <option value="MMXM">MMXM</option>
                    <option value="Breaker Block">Breaker Block</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Session</label>
                  <select name="session" defaultValue={selectedTrade.session || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Velg session...</option>
                    <option value="London">London</option>
                    <option value="NY AM">NY AM</option>
                    <option value="NY PM">NY PM</option>
                    <option value="Macro">Macro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">HTF Bias</label>
                  <select name="htfBias" defaultValue={selectedTrade.htfBias || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Velg bias...</option>
                    <option value="Pro-trend">Pro-trend</option>
                    <option value="Counter-trend">Counter-trend</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Grade</label>
                  <select name="grade" defaultValue={selectedTrade.grade || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Karakter...</option>
                    <option value="A">A - Perfekt</option>
                    <option value="B">B - Bra</option>
                    <option value="C">C - Grei</option>
                    <option value="D">D - Dårlig</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Planlagt R:R</label>
                  <input name="plannedRr" type="number" step="0.1" defaultValue={selectedTrade.plannedRr ?? ""} placeholder="F.eks. 3.0" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Resultat i R</label>
                  <input name="resultRr" type="number" step="0.1" defaultValue={selectedTrade.resultRr ?? ""} placeholder="F.eks. 2.5" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">MFE (Ticks/Pts)</label>
                  <input name="mfe" type="number" defaultValue={selectedTrade.mfe ?? ""} placeholder="Maks profitt under trade" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">MAE (Ticks/Pts)</label>
                  <input name="mae" type="number" defaultValue={selectedTrade.mae ?? ""} placeholder="Maks drawdown under trade" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input name="newsCatalyst" type="checkbox" defaultChecked={selectedTrade.newsCatalyst || false} className="rounded bg-black/50 border-white/10 text-blue-500 focus:ring-blue-500" />
                  Nyhetskatalysator (Ja)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input name="rulesFollowed" type="checkbox" defaultChecked={selectedTrade.rulesFollowed || false} className="rounded bg-black/50 border-white/10 text-blue-500 focus:ring-blue-500" />
                  Fulgte alle regler
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Hvilken regel ble evt. brutt?</label>
                <input name="ruleBroken" defaultValue={selectedTrade.ruleBroken || ""} placeholder="F.eks. 'Tok trade før 09:30'" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Emosjonell Tilstand</label>
                <select name="emotionalState" defaultValue={selectedTrade.emotionalState || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="">Hvordan følte du deg?</option>
                  <option value="Rolig">Rolig og Fokusert</option>
                  <option value="FOMO">FOMO</option>
                  <option value="Stresset">Stresset / Nølende</option>
                  <option value="Tilted">Tilted / Revansje</option>
                  <option value="Kjedet meg">Kjedet meg / Overtrading</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">SMT Type</label>
                <input name="smtType" defaultValue={selectedTrade.smtType || ""} placeholder="F.eks ES/NQ" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Notater</label>
                <textarea 
                  name="notes" 
                  defaultValue={selectedTrade.notes || ""} 
                  rows={4}
                  placeholder="Hva gikk bra? Hva kunne vært bedre?"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none" 
                />
              </div>
            </form>
          </div>
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button 
              type="submit" 
              form="edit-trade-form"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover-lift disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Lagrer...' : 'Lagre Oppdateringer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
