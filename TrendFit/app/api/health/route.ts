import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: 'degraded',
      service: 'trendfit',
      database: 'not_configured',
      timestamp,
    }, { status: 503 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      service: 'trendfit',
      database: 'connected',
      timestamp,
    });
  } catch {
    return NextResponse.json({
      status: 'degraded',
      service: 'trendfit',
      database: 'unavailable',
      timestamp,
    }, { status: 503 });
  }
}
