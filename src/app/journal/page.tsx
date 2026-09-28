import { getTrades } from '@/app/actions';
import JournalClient from './JournalClient';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const trades = await getTrades();
  
  return (
    <div className="animate-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Trade Journal</h1>
        <p className="text-gray-400">Review your executions and fill in manual data points to build your edge.</p>
      </header>
      
      <JournalClient initialTrades={trades} />
    </div>
  );
}
