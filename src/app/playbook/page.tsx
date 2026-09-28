import { getTrades } from '@/app/actions';
import PlaybookClient from './PlaybookClient';

export const dynamic = 'force-dynamic';

export default async function PlaybookPage() {
  const allTrades = await getTrades();
  
  // Filtrer ut kun A-setups for Playbook
  const aTrades = allTrades.filter(trade => trade.grade === 'A');
  
  return (
    <div className="animate-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Playbook</h1>
        <p className="text-gray-400">Your library of A-setups. Study these patterns to train your eye.</p>
      </header>
      
      <PlaybookClient trades={aTrades} />
    </div>
  );
}
