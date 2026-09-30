'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trade } from '@prisma/client';
import { updateTrade, uploadScreenshot, deleteTrade } from '@/app/actions';
import { X, Save, ArrowRight, Activity, Clock, Upload, Edit3, Trash2 } from 'lucide-react';

export default function JournalClient({ initialTrades }: { initialTrades: Trade[] }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedTrade) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;

          setIsSaving(true);
          const fd = new FormData();
          fd.append('file', file);
          const res = await uploadScreenshot(selectedTrade.id, fd);
          if (res.success && res.data) {
            setTrades(prev => prev.map(t => t.id === selectedTrade.id ? { ...t, screenshots: res.data.screenshots } : t));
            setSelectedTrade(prev => prev ? { ...prev, screenshots: res.data.screenshots } : null);
          }
          setIsSaving(false);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedTrade]);

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
      accountType: formData.get('accountType') as string,
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
      setSelectedTrade({ ...selectedTrade, ...data } as Trade);
      setIsEditing(false);
    } else {
      alert("Error saving trade.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedTrade) return;
    if (!confirm("Are you sure you want to delete this trade? This action cannot be undone and will remove the trade from all pages.")) return;
    
    setIsSaving(true);
    const result = await deleteTrade(selectedTrade.id);
    if (result.success) {
      setTrades(trades.filter(t => t.id !== selectedTrade.id));
      setSelectedTrade(null);
    } else {
      alert("Error deleting trade.");
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
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">PnL</th>
                <th className="px-6 py-4">Setup</th>
                <th className="px-6 py-4">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trades.map((trade) => (
                <tr 
                  key={trade.id} 
                  onClick={() => {
                    setSelectedTrade(trade);
                    setIsEditing(false);
                  }}
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
                    No trades found. Go to Upload to import.
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
            <h3 className="font-bold text-lg text-white">{isEditing ? 'Edit Trade' : 'Trade Details'}</h3>
            <button onClick={() => { setSelectedTrade(null); setIsEditing(false); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {!isEditing ? (
              <TradeDetailsView trade={selectedTrade} />
            ) : (
              <>
            <div className="flex gap-4 mb-6">
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

            <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
              {selectedTrade.screenshots ? (
                <div className="relative group rounded-lg overflow-hidden h-32 bg-black">
                  <img src={selectedTrade.screenshots} className="w-full h-full object-cover opacity-80" alt="Trade Screenshot" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white text-xs font-semibold">Change Image</p>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsSaving(true);
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await uploadScreenshot(selectedTrade.id, fd);
                    if (res.success && res.data) {
                      setTrades(trades.map(t => t.id === selectedTrade.id ? { ...t, screenshots: res.data.screenshots } : t));
                      setSelectedTrade({ ...selectedTrade, screenshots: res.data.screenshots });
                    }
                    setIsSaving(false);
                  }} />
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-white/10 rounded-lg p-6 hover:bg-white/5 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload or press Cmd+V to paste</p>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsSaving(true);
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await uploadScreenshot(selectedTrade.id, fd);
                    if (res.success && res.data) {
                      setTrades(trades.map(t => t.id === selectedTrade.id ? { ...t, screenshots: res.data.screenshots } : t));
                      setSelectedTrade({ ...selectedTrade, screenshots: res.data.screenshots });
                    }
                    setIsSaving(false);
                  }} />
                </div>
              )}
            </div>

            <form id="edit-trade-form" onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Timeframe</label>
                  <select name="timeframe" defaultValue={selectedTrade.timeframe || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select timeframe...</option>
                    <option value="4h/15m">4h / 15m</option>
                    <option value="1h/5m">1h / 5m</option>
                    <option value="30m/3m">30m / 3m</option>
                    <option value="15m/1m">15m / 1m</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Setup</label>
                  <select name="setup" defaultValue={selectedTrade.setup || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select setup...</option>
                    <option value="Orderblock">Orderblock</option>
                    <option value="Breakerblock">Breakerblock</option>
                    <option value="FVG">FVG</option>
                    <option value="IFVG">IFVG</option>
                    <option value="CSD">CSD</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Session</label>
                  <select name="session" defaultValue={selectedTrade.session || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select session...</option>
                    <option value="NY AM">NY AM</option>
                    <option value="NY PM">NY PM</option>
                    <option value="London">London</option>
                    <option value="Asia">Asia</option>
                    <option value="Out of session">Out of session</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">HTF Bias</label>
                  <select name="htfBias" defaultValue={selectedTrade.htfBias || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select bias...</option>
                    <option value="Pro-trend">Pro-trend</option>
                    <option value="Counter-trend">Counter-trend</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Grade</label>
                  <select name="grade" defaultValue={selectedTrade.grade || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Grade...</option>
                    <option value="A">A - Perfect</option>
                    <option value="B">B - Good</option>
                    <option value="C">C - Okay</option>
                    <option value="D">D - Poor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Account Type</label>
                  <select name="accountType" defaultValue={selectedTrade.accountType || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select account...</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="Funded">Funded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Planned R:R</label>
                  <input name="plannedRr" type="number" step="0.1" defaultValue={selectedTrade.plannedRr ?? ""} placeholder="E.g. 3.0" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Result in R</label>
                  <input name="resultRr" type="number" step="0.1" defaultValue={selectedTrade.resultRr ?? ""} placeholder="E.g. 2.5" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">MFE (Ticks/Pts)</label>
                  <input name="mfe" type="number" defaultValue={selectedTrade.mfe ?? ""} placeholder="Max profit during trade" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-semibold">MAE (Ticks/Pts)</label>
                  <input name="mae" type="number" defaultValue={selectedTrade.mae ?? ""} placeholder="Max drawdown during trade" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input name="newsCatalyst" type="checkbox" defaultChecked={selectedTrade.newsCatalyst || false} className="rounded bg-black/50 border-white/10 text-blue-500 focus:ring-blue-500" />
                  News Catalyst (Yes)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input name="rulesFollowed" type="checkbox" defaultChecked={selectedTrade.rulesFollowed || false} className="rounded bg-black/50 border-white/10 text-blue-500 focus:ring-blue-500" />
                  Followed all rules
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Which rule was broken (if any)?</label>
                <input name="ruleBroken" defaultValue={selectedTrade.ruleBroken || ""} placeholder="E.g. 'Took trade before 09:30'" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Emotional State</label>
                <select name="emotionalState" defaultValue={selectedTrade.emotionalState || ""} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="">How did you feel?</option>
                  <option value="Rolig">Calm and Focused</option>
                  <option value="FOMO">FOMO</option>
                  <option value="Stresset">Stressed / Hesitant</option>
                  <option value="Tilted">Tilted / Revenge</option>
                  <option value="Kjedet meg">Bored / Overtrading</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">SMT Type</label>
                <input name="smtType" defaultValue={selectedTrade.smtType || ""} placeholder="F.eks ES/NQ" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Notes</label>
                <textarea 
                  name="notes" 
                  defaultValue={selectedTrade.notes || ""} 
                  rows={4}
                  placeholder="What went well? What could be improved?"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none" 
                />
              </div>
            </form>
              </>
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-black/20">
            {!isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover-lift"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Trade
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                  title="Delete Trade"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="edit-trade-form"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TradeDetailsView({ trade }: { trade: Trade }) {
  return (
    <div className="space-y-6 animate-in">
      {/* Screenshot */}
      <div className="rounded-xl overflow-hidden bg-black/50 border border-white/5">
        {trade.screenshots ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trade.screenshots} alt="Trade Screenshot" className="w-full h-auto object-cover" />
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
          <p className="font-mono text-white">{trade.entryPrice}</p>
        </div>
        <Activity className="w-5 h-5 text-gray-500 my-auto" />
        <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Exit Price</p>
          <p className="font-mono text-white">{trade.exitPrice}</p>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Setup" value={trade.setup || '-'} />
        <StatBox label="Session" value={trade.session || '-'} />
        <StatBox label="Timeframe" value={trade.timeframe || '-'} />
        <StatBox label="Account Type" value={trade.accountType || '-'} />
        <StatBox label="Grade" value={trade.grade || '-'} />
        <StatBox label="HTF Bias" value={trade.htfBias || '-'} />
        <StatBox label="SMT" value={trade.smtType || '-'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Planned R:R" value={trade.plannedRr ? trade.plannedRr.toString() : '-'} />
        <StatBox label="Result R:R" value={trade.resultRr ? trade.resultRr.toString() : '-'} />
        <StatBox label="MFE" value={trade.mfe ? trade.mfe.toString() : '-'} />
        <StatBox label="MAE" value={trade.mae ? trade.mae.toString() : '-'} />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 uppercase">Analysis & Notes</h4>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
          <div>
            <span className="text-xs text-gray-500">Emotional State</span>
            <p className="text-sm text-white font-medium">{trade.emotionalState || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Rules Followed?</span>
            <p className="text-sm text-white font-medium">{trade.rulesFollowed ? '✅ Yes' : '❌ No'}</p>
          </div>
          {!trade.rulesFollowed && trade.ruleBroken && (
            <div>
              <span className="text-xs text-gray-500 text-red-400">Rule Broken</span>
              <p className="text-sm text-white font-medium">{trade.ruleBroken}</p>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500">Notes</span>
            <p className="text-sm text-white whitespace-pre-wrap">{trade.notes || '-'}</p>
          </div>
        </div>
      </div>
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

