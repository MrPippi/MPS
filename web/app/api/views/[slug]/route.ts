import { NextRequest, NextResponse } from 'next/server';
import { getRedis, viewKey } from '@/shared/lib/redis';

interface Params {
  params: Promise<{ slug: string }>;
}

// POST /api/views/[slug] — increment and return new count
export async function POST(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  const views = await redis.incr(viewKey(slug));
  return NextResponse.json({ views });
}

// GET /api/views/[slug] — return current count without incrementing
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  const raw = await redis.get<number>(viewKey(slug));
  return NextResponse.json({ views: raw ?? 0 });
}
