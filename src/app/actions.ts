'use server';

import { PrismaClient, Prisma } from '@prisma/client';
import { ParsedTrade } from '@/lib/parser';

const prisma = new PrismaClient();

export async function saveTrades(trades: ParsedTrade[]) {
  try {
    let count = 0;
    
    for (const trade of trades) {
      const existingTrade = await prisma.trade.findFirst({
        where: {
          symbol: trade.symbol,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime
        }
      });
      
      if (!existingTrade) {
        await prisma.trade.create({ data: trade });
        count++;
      }
    }

    return { success: true, count };
  } catch (error: any) {
    console.error("Error saving trades:", error);
    return { success: false, error: error.message };
  }
}

export async function getTrades() {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { entryTime: 'desc' }
    });
    return trades;
  } catch (error) {
    console.error("Error fetching trades:", error);
    return [];
  }
}

export async function updateTrade(id: string, data: Partial<Prisma.TradeUpdateInput>) {
  try {
    const updated = await prisma.trade.update({
      where: { id },
      data
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating trade:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTrade(id: string) {
  try {
    await prisma.trade.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting trade:", error);
    return { success: false, error: error.message };
  }
}

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadScreenshot(tradeId: string, formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'Ingen fil funnet' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '_')}`;
    const publicPath = `/uploads/${filename}`;
    const dest = join(process.cwd(), 'public', 'uploads', filename);
    
    await writeFile(dest, buffer);

    const updated = await prisma.trade.update({
      where: { id: tradeId },
      data: { screenshots: publicPath }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return { success: false, error: error.message };
  }
}
