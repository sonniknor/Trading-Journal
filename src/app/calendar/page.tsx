import { getTrades } from '@/app/actions';
import CalendarClient from './CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const trades = await getTrades();
  
  return (
    <div className="animate-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Trading Calendar</h1>
        <p className="text-gray-400">Get a visual overview of your green and red days this month.</p>
      </header>
      
      <CalendarClient trades={trades} />
    </div>
  );
}
