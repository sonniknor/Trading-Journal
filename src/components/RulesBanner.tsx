import { getTrades } from '@/app/actions';
import { isSameWeek, startOfDay, isSameDay } from 'date-fns';
import { AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';

export default async function RulesBanner() {
  const trades = await getTrades();
  if (!trades || trades.length === 0) return null;

  // Sorter trades kronologisk (nyeste først)
  const sortedTrades = [...trades].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  
  // Evaluere regler basert på faktisk dag i dag
  const today = new Date();
  const tradesToday = sortedTrades.filter(t => isSameDay(new Date(t.entryTime), today));
  
  // Regel 1 & 2: Tap i dag
  const totalLossesToday = tradesToday.filter(t => t.pnl <= -50).length;
  
  // Regel 3: Maks 2 røde dager pr uke
  // Finn alle dager i denne kalenderuken
  const tradesThisWeek = sortedTrades.filter(t => isSameWeek(new Date(t.entryTime), today, { weekStartsOn: 1 }));
  const dailyPnLThisWeek: Record<string, number> = {};
  tradesThisWeek.forEach(t => {
    const day = startOfDay(new Date(t.entryTime)).toISOString();
    dailyPnLThisWeek[day] = (dailyPnLThisWeek[day] || 0) + t.pnl;
  });
  const redDaysThisWeek = Object.values(dailyPnLThisWeek).filter(pnl => pnl <= -50).length;

  // Regel 4: SMT må være tilstede (sjekker bare den aller siste traden totalt, uavhengig av dag)
  const lastTradeEver = sortedTrades[0];
  const isSmtMissing = lastTradeEver && !lastTradeEver.smtType;

  // Evaluer hvilke advarsler som skal vises (mest alvorlig først)
  let alerts = [];

  if (redDaysThisWeek >= 2) {
    alerts.push({
      level: 'critical',
      title: 'Max red days reached!',
      message: 'You already have 2 red days this week (Rule 3). Step away and take the rest of the week off to protect your capital.',
      icon: XCircle
    });
  } else if (totalLossesToday >= 2) {
    alerts.push({
      level: 'critical',
      title: 'Daily limit reached!',
      message: 'You have hit 2 losses today (Rule 1). Mental UI is locked. Please stop trading for today.',
      icon: XCircle
    });
  } else if (totalLossesToday === 1) {
    alerts.push({
      level: 'warning',
      title: 'Caution: 1 Loss today',
      message: 'You have 1 loss today. Your next trade must be with HALF risk (Rule 2). Remember that your next loss is your last for the day.',
      icon: AlertTriangle
    });
  }

  if (isSmtMissing) {
    alerts.push({
      level: 'warning',
      title: 'Rule violation detected',
      message: 'Your previous trade is missing SMT confirmation (Rule 4). Make sure you follow the system!',
      icon: ShieldAlert
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
      {alerts.map((alert, idx) => {
        const isCritical = alert.level === 'critical';
        return (
          <div 
            key={idx}
            className="group relative flex items-center justify-center"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* The Icon Button */}
            <div className={`glass-panel w-12 h-12 rounded-full flex items-center justify-center border shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 ${isCritical ? 'border-red-500/40 bg-red-950/80 text-red-400' : 'border-yellow-500/40 bg-yellow-950/80 text-yellow-400'} animate-in`}>
              <alert.icon className="w-6 h-6" />
            </div>

            {/* The Expanded Tooltip */}
            <div className={`absolute right-14 top-0 w-72 glass-panel p-4 rounded-2xl border shadow-2xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 origin-top-right ${isCritical ? 'border-red-500/40 bg-red-950/90 backdrop-blur-md' : 'border-yellow-500/40 bg-yellow-950/90 backdrop-blur-md'}`}>
              <h4 className={`font-bold text-sm ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                {alert.title}
              </h4>
              <p className="text-gray-200 text-xs mt-1.5 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
