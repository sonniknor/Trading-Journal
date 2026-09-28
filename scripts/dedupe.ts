import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function dedupe() {
  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const seen = new Set();
  let deleted = 0;

  for (const trade of trades) {
    const key = `${trade.symbol}-${trade.entryTime.toISOString()}`;
    if (seen.has(key)) {
      await prisma.trade.delete({ where: { id: trade.id } });
      deleted++;
    } else {
      seen.add(key);
    }
  }

  console.log(`Slettet ${deleted} duplikater fra databasen.`);
}

dedupe()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
