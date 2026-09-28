import { getTrades } from '@/app/actions';
import DashboardClient from './DashboardClient';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const trades = await getTrades();
  
  // Sort oldest to newest for equity curve
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  
  let totalPnL = 0;
  let wins = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let peakPnL = 0;

  const chartData: { date: string, equity: number }[] = [];
  
  // Startpunkt i grafen
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
      // Still add BE trades to gross profit/loss for accurate Profit Factor?
      // Or just keep them out of PF as well? Usually BE doesn't affect PF significantly, 
      // but let's add them to gross for total accuracy.
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

  return (
    <DashboardClient 
      totalPnL={totalPnL}
      winRate={winRate}
      profitFactor={profitFactor}
      currentDrawdown={currentDrawdown}
      chartData={chartData}
      tradeCount={sortedTrades.length}
    />
  );
}
