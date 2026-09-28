'use client';

import { useState, useMemo } from 'react';
import { Trade } from '@prisma/client';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { nb } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function CalendarClient({ trades }: { trades: Trade[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Compute daily stats
  const dailyStats = useMemo(() => {
    const stats: Record<string, { pnl: number; tradesCount: number }> = {};
    
    trades.forEach(trade => {
      const dateKey = format(new Date(trade.entryTime), 'yyyy-MM-dd');
      if (!stats[dateKey]) {
        stats[dateKey] = { pnl: 0, tradesCount: 0 };
      }
      stats[dateKey].pnl += trade.pnl;
      stats[dateKey].tradesCount += 1;
    });
    
    return stats;
  }, [trades]);

  // Generate calendar grid (including leading/trailing days)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // start week on Monday
  const startDate = startOfWeek(monthStart, { weekStarts: 1 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate monthly overview
  const currentMonthTrades = trades.filter(t => isSameMonth(new Date(t.entryTime), currentDate));
  const monthlyPnL = currentMonthTrades.reduce((sum, t) => sum + t.pnl, 0);
  const winningDays = Object.values(dailyStats)
    .filter(stat => stat.pnl >= 50).length;
  const losingDays = Object.values(dailyStats)
    .filter(stat => stat.pnl <= -50).length;

  return (
    <div className="space-y-6">
      {/* Monthly Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Månedlig PnL</p>
            <p className={`text-2xl font-bold ${monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${monthlyPnL.toFixed(2)}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${monthlyPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {monthlyPnL >= 0 ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Grønne Dager</p>
            <p className="text-2xl font-bold text-white">{winningDays}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Røde Dager</p>
            <p className="text-2xl font-bold text-white">{losingDays}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <TrendingDown className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: nb })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/10 text-gray-300 transition-colors">
              I dag
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {/* Weekday headers */}
          {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-500 mb-2">
              {day}
            </div>
          ))}

          {/* Days */}
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const stat = dailyStats[dateKey];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            let bgClass = 'bg-white/5 border-transparent';
            let textClass = 'text-gray-400';

            if (isCurrentMonth) {
              textClass = 'text-white';
              if (stat) {
                if (stat.pnl >= 50) bgClass = 'bg-green-500/20 border-green-500/30';
                else if (stat.pnl <= -50) bgClass = 'bg-red-500/20 border-red-500/30';
                else bgClass = 'bg-gray-500/20 border-gray-500/30'; // BE dag
              } else {
                bgClass = 'bg-black/20 border-white/5';
              }
            } else {
              bgClass = 'bg-transparent border-transparent opacity-30';
            }

            if (isTodayDate) {
              bgClass += ' ring-2 ring-blue-500';
            }

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[100px] p-3 rounded-2xl border transition-all ${bgClass} hover:scale-[1.02] cursor-default flex flex-col`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-semibold ${textClass}`}>
                    {format(day, 'd')}
                  </span>
                  {stat && stat.tradesCount > 0 && (
                    <span className="text-[10px] font-medium bg-black/40 px-1.5 py-0.5 rounded text-gray-300">
                      {stat.tradesCount} trades
                    </span>
                  )}
                </div>
                
                {stat && (
                  <div className="mt-auto flex flex-col items-center justify-center">
                    <span className={`font-bold ${stat.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${Math.abs(stat.pnl).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
