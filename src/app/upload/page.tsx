'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { parseTradovateCsv, ParsedTrade } from '@/lib/parser';

import { saveTrades } from '@/app/actions';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const trades = parseTradovateCsv(text);
        setParsedTrades(trades);
      } catch (err: any) {
        setError(err.message);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleSave = async () => {
    if (parsedTrades.length === 0) return;
    setIsUploading(true);
    setError(null);
    
    const result = await saveTrades(parsedTrades);
    
    if (result.success) {
      alert(`Success! ${result.count} trades were saved.`);
      setParsedTrades([]);
      setFile(null);
    } else {
      setError(result.error || 'Something went wrong during saving');
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Import Trades</h1>
        <p className="text-gray-400">Upload CSV export from Tradovate to automatically log your executions.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl border-dashed border-2 border-white/10 hover:border-blue-500/50 transition-colors relative overflow-hidden group">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Drag and drop CSV file here</h3>
            <p className="text-sm text-gray-400">or click to select file from your computer</p>
          </div>
          
          {file && !error && (
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              {file.name} selected
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {parsedTrades.length > 0 && (
        <div className="space-y-4 animate-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Preview ({parsedTrades.length} trades)
            </h2>
            <button 
              onClick={handleSave}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50 hover-lift"
            >
              {isUploading ? 'Saving...' : 'Save to Journal'}
            </button>
          </div>
          
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 bg-white/5 uppercase">
                  <tr>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Direction</th>
                    <th className="px-6 py-4">Entry Time</th>
                    <th className="px-6 py-4">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedTrades.slice(0, 5).map((trade, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {trade.entryTime.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTrades.length > 5 && (
                <div className="p-4 text-center text-sm text-gray-400 bg-white/5">
                  Showing 5 of {parsedTrades.length} trades
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
