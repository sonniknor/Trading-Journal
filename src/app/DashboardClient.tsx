'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Trade } from '@prisma/client';
import { format } from 'date-fns';

export default function DashboardClient({ trades }: { trades: Trade[] }) {
  const [accountFilter, setAccountFilter] = useState<string>('All');

  const filteredTrades = useMemo(() => {
    if (accountFilter === 'All') return trades;
    // Trades that have NO accountType are included in 'All', but if they filter by Funded, only show Funded.
    // However, if they want to see trades without accountType, maybe they stay under 'All'.
    return trades.filter(t => t.accountType === accountFilter);
  }, [trades, accountFilter]);

  const stats = useMemo(() => {
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
    
    let totalPnL = 0;
    let wins = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let peakPnL = 0;

    const chartData: { date: string, equity: number }[] = [];
    chartData.push({ date: 'Start', equity: 0 });

    let beTrades = 0;

    sortedTrades.forEach(trade => {
      totalPnL += trade.pnl;
      
      if (totalPnL > peakPnL) {
        peakPnL = totalPnL;
      }
      
      if (trade.pnl >= 50) {
        wins++;
        grossProfit += trade.pnl;
      } else if (trade.pnl <= -50) {
        grossLoss += Math.abs(trade.pnl);
      } else {
        beTrades++;
        if (trade.pnl > 0) grossProfit += trade.pnl;
        else if (trade.pnl < 0) grossLoss += Math.abs(trade.pnl);
      }
      
      chartData.push({
        date: format(new Date(trade.entryTime), 'dd. MMM'),
        equity: totalPnL
      });
    });

    const currentDrawdown = peakPnL - totalPnL;
    const totalDecisiveTrades = wins + (sortedTrades.length - wins - beTrades); // total minus BE
    const winRate = totalDecisiveTrades > 0 ? ((wins / totalDecisiveTrades) * 100).toFixed(1) + '%' : '0.0%';
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00');

    return {
      totalPnL,
      winRate,
      profitFactor,
      currentDrawdown,
      chartData,
      tradeCount: sortedTrades.length
    };
  }, [filteredTrades]);

  const isProfitable = stats.totalPnL >= 0;

  return (
    <div className="space-y-8 animate-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back! You have logged {stats.tradeCount} trades in total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400 font-medium">Account:</label>
          <select 
            value={accountFilter} 
            onChange={(e) => setAccountFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
          >
            <option value="All">All Accounts</option>
            <option value="Evaluation">Evaluation</option>
            <option value="Funded">Funded</option>
          </select>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Net PnL" 
          value={`$${Math.abs(stats.totalPnL).toFixed(2)}`} 
          isPositive={isProfitable}
          isCurrency={true}
          icon={<Activity className={`w-5 h-5 ${isProfitable ? 'text-green-400' : 'text-red-400'}`} />} 
        />
        <MetricCard 
          title="Win Rate" 
          value={stats.winRate} 
          isPositive={parseFloat(stats.winRate) >= 50} 
          icon={<Target className="w-5 h-5 text-blue-400" />} 
        />
        <MetricCard 
          title="Profit Factor" 
          value={stats.profitFactor} 
          isPositive={parseFloat(stats.profitFactor) >= 1.5 || stats.profitFactor === '∞'} 
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />} 
        />
        <MetricCard 
          title="Current Drawdown" 
          value={`-$${stats.currentDrawdown.toFixed(2)}`} 
          isPositive={stats.currentDrawdown === 0} 
          icon={<TrendingDown className="w-5 h-5 text-red-400" />} 
        />
      </div>

      {/* Main Chart Area */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Cumulative PnL (Equity Curve)</h2>
          {stats.tradeCount === 0 && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              No trades yet
            </div>
          )}
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#4b5563" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#4b5563" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'PnL']}
              />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEquity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, isPositive, isCurrency, icon }: { title: string, value: string, isPositive: boolean, isCurrency?: boolean, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-5 rounded-2xl hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-xl border border-white/5">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? (isCurrency ? 'Profit' : 'Good') : (isCurrency ? 'Loss' : 'Warning')}
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className={`text-2xl font-bold ${title === 'Total Net PnL' && !isPositive ? 'text-red-400' : 'text-white'}`}>
          {title === 'Total Net PnL' && !isPositive ? '-' : ''}{value}
        </p>
      </div>
    </div>
  );
}
