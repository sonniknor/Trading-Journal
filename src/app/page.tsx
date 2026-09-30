import { getTrades } from '@/app/actions';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const trades = await getTrades();
  
  return (
    <DashboardClient trades={trades} />
  );
}
