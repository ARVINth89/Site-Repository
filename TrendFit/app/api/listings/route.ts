import { ListingCategory, ListingStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const categories = new Set(Object.values(ListingCategory));

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawLimit = Number(params.get('limit') ?? 12);
  const take = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 40) : 12;
  const cursor = params.get('cursor');
  const query = params.get('q')?.trim().slice(0, 100);
  const city = params.get('city')?.trim().slice(0, 80);
  const rawCategory = params.get('category');
  const category = rawCategory && categories.has(rawCategory as ListingCategory)
    ? (rawCategory as ListingCategory)
    : undefined;

  if (rawCategory && !category) {
    return NextResponse.json({ error: 'دسته‌بندی نامعتبر است.' }, { status: 400 });
  }

  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.PUBLISHED,
    ...(category ? { category } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    } : {}),
  };

  try {
    const rows = await prisma.listing.findMany({
      where,
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, title: true, slug: true, description: true, category: true,
        city: true, priceLabel: true, imageUrl: true, isFeatured: true,
        featuredUntil: true, viewCount: true, createdAt: true,
        owner: { select: { id: true, name: true } },
      },
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take);
    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ error: 'دریافت آگهی‌ها موقتاً ممکن نیست.' }, { status: 503 });
  }
}
