import { getTrades } from '@/app/actions';
import { isSameWeek, startOfDay, isSameDay } from 'date-fns';
import { AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';

export default async function RulesBanner() {
  const trades = await getTrades();
  if (!trades || trades.length === 0) return null;

  // Sorter trades kronologisk (nyeste først)
  const sortedTrades = [...trades].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  
  // Finn nyeste dato som har trades (i tilfelle "i dag" ikke har trades, kan vi sjekke siste aktive dag)
  // Men for regler er det best å sjekke "I dag". For demo-formål sjekker vi den siste aktive dagen hvis "i dag" ikke har trades.
  const latestDate = new Date(sortedTrades[0].entryTime);
  const tradesToday = sortedTrades.filter(t => isSameDay(new Date(t.entryTime), latestDate));
  
  // Regel 1 & 2: Tap i dag
  let consecutiveLossesToday = 0;
  for (const t of tradesToday) {
    if (t.pnl < 0) {
      consecutiveLossesToday++;
    } else if (t.pnl > 0) {
      // Hvis de har en vinner, bryter det rekken? "Maksimalt 2 tap pr dag" betyr kanskje totalt 2 tap uansett rekke.
      // La oss telle totalt antall tap i dag.
    }
  }
  
  const totalLossesToday = tradesToday.filter(t => t.pnl <= -50).length;
  const lastTradeToday = tradesToday[0]; // Siden den er sortert nyest først
  
  // Regel 3: Maks 2 røde dager pr uke
  // Finn alle dager i samme uke som latestDate
  const tradesThisWeek = sortedTrades.filter(t => isSameWeek(new Date(t.entryTime), latestDate, { weekStarts: 1 }));
  const dailyPnLThisWeek: Record<string, number> = {};
  tradesThisWeek.forEach(t => {
    const day = startOfDay(new Date(t.entryTime)).toISOString();
    dailyPnLThisWeek[day] = (dailyPnLThisWeek[day] || 0) + t.pnl;
  });
  const redDaysThisWeek = Object.values(dailyPnLThisWeek).filter(pnl => pnl <= -50).length;

  // Regel 4: SMT må være tilstede
  const isSmtMissing = lastTradeToday && !lastTradeToday.smtType;

  // Evaluer hvilke advarsler som skal vises (mest alvorlig først)
  let alerts = [];

  if (redDaysThisWeek >= 2) {
    alerts.push({
      level: 'critical',
      title: 'Maks røde dager nådd!',
      message: 'Du har allerede 2 røde dager denne uken (Regel 3). Skru av skjermen og ta fri resten av uken for å beskytte kapitalen.',
      icon: XCircle
    });
  } else if (totalLossesToday >= 2) {
    alerts.push({
      level: 'critical',
      title: 'Dagsgrense nådd!',
      message: 'Du har nådd 2 tap i dag (Regel 1). Mental UI er låst. Vennligst stopp tradingen for i dag.',
      icon: XCircle
    });
  } else if (totalLossesToday === 1) {
    alerts.push({
      level: 'warning',
      title: 'Forsiktig: 1 Tap i dag',
      message: 'Du har 1 tap i dag. Din neste trade må være med HALV risiko (Regel 2). Husk at neste tap er ditt siste for dagen.',
      icon: AlertTriangle
    });
  }

  if (isSmtMissing) {
    alerts.push({
      level: 'warning',
      title: 'Regelbrudd oppdaget',
      message: 'Din forrige trade mangler SMT-bekreftelse (Regel 4). Sørg for at du følger systemet!',
      icon: ShieldAlert
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
      {alerts.map((alert, idx) => {
        const isCritical = alert.level === 'critical';
        return (
          <div 
            key={idx}
            className={`glass-panel p-3 rounded-xl flex items-start gap-3 border shadow-2xl ${isCritical ? 'border-red-500/40 bg-red-950/80 backdrop-blur-md' : 'border-yellow-500/40 bg-yellow-950/80 backdrop-blur-md'} animate-in`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`mt-0.5 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
              <alert.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold text-sm ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                {alert.title}
              </h4>
              <p className="text-gray-200 text-xs mt-1 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
