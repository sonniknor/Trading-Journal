import Papa from 'papaparse';
import { Prisma } from '@prisma/client';

// Representing the shape of the data we get from the CSV parsing, ready for DB insert.
export type ParsedTrade = Omit<Prisma.TradeCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'newsCatalyst'> & { newsCatalyst: boolean };

export function parseTradovateCsv(csvContent: string): ParsedTrade[] {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error('Feil ved parsing av CSV: ' + parsed.errors[0].message);
  }

  const trades: ParsedTrade[] = [];

  for (const row of parsed.data as Record<string, string>[]) {
    // Check if essential columns are present
    if (!row.symbol || !row.boughtTimestamp || !row.soldTimestamp) {
      continue;
    }

    // Parse PnL: e.g. "$(490.00)" -> -490.00, "$490.00" -> 490.00
    const pnlString = row.pnl || "$0.00";
    const isLoss = pnlString.includes('(') && pnlString.includes(')');
    const cleanedPnl = pnlString.replace(/[^\d.-]/g, '');
    let pnlValue = parseFloat(cleanedPnl);
    if (isLoss) {
      pnlValue = -Math.abs(pnlValue);
    }

    // Parse timestamps (Format: "MM/DD/YYYY HH:mm:ss")
    const boughtTime = new Date(row.boughtTimestamp);
    const soldTime = new Date(row.soldTimestamp);
    
    // Determine direction
    // If bought before sold -> Long
    // If sold before bought -> Short
    const isLong = boughtTime <= soldTime;
    
    const direction = isLong ? "Long" : "Short";
    const entryTime = isLong ? boughtTime : soldTime;
    const exitTime = isLong ? soldTime : boughtTime;
    const entryPrice = parseFloat(isLong ? row.buyPrice : row.sellPrice);
    const exitPrice = parseFloat(isLong ? row.sellPrice : row.buyPrice);

    const qty = parseInt(row.qty, 10);
    const tickSize = parseFloat(row._tickSize || "0.25");

    trades.push({
      symbol: row.symbol,
      direction,
      entryTime,
      exitTime,
      entryPrice,
      exitPrice,
      pnl: pnlValue,
      qty,
      tickSize,
      newsCatalyst: false,
    });
  }

  return trades;
}
