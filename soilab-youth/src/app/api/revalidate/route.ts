import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('cardnews', {});
  revalidateTag('newsletter', {});
  revalidateTag('stats', {});

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
