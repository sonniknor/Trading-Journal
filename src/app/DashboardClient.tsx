'use client';

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

interface DashboardClientProps {
  totalPnL: number;
  winRate: string;
  profitFactor: string;
  currentDrawdown: number;
  chartData: { date: string, equity: number }[];
  tradeCount: number;
}

export default function DashboardClient({ 
  totalPnL, 
  winRate, 
  profitFactor, 
  currentDrawdown,
  chartData,
  tradeCount
}: DashboardClientProps) {

  const isProfitable = totalPnL >= 0;

  return (
    <div className="space-y-8 animate-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Oversikt</h1>
        <p className="text-gray-400">
          Velkommen tilbake! Du har loggført {tradeCount} trades totalt.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Net PnL" 
          value={`$${Math.abs(totalPnL).toFixed(2)}`} 
          isPositive={isProfitable}
          isCurrency={true}
          icon={<Activity className={`w-5 h-5 ${isProfitable ? 'text-green-400' : 'text-red-400'}`} />} 
        />
        <MetricCard 
          title="Win Rate" 
          value={winRate} 
          isPositive={parseFloat(winRate) >= 50} 
          icon={<Target className="w-5 h-5 text-blue-400" />} 
        />
        <MetricCard 
          title="Profit Factor" 
          value={profitFactor} 
          isPositive={parseFloat(profitFactor) >= 1.5 || profitFactor === '∞'} 
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />} 
        />
        <MetricCard 
          title="Current Drawdown" 
          value={`-$${currentDrawdown.toFixed(2)}`} 
          isPositive={currentDrawdown === 0} 
          icon={<TrendingDown className="w-5 h-5 text-red-400" />} 
        />
      </div>

      {/* Main Chart Area */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Cumulative PnL (Equity Curve)</h2>
          {tradeCount === 0 && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Ingen trades enda
            </div>
          )}
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
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
          {isPositive ? (isCurrency ? 'Profitt' : 'Bra') : (isCurrency ? 'Tap' : 'Advarsel')}
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
