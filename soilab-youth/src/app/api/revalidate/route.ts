import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('cardnews', { expire: 0 });
  revalidateTag('newsletter', { expire: 0 });
  revalidateTag('stats', { expire: 0 });
  revalidateTag('ontong-youth-policies', { expire: 0 });
  revalidateTag('ontong-youth-content', { expire: 0 });
  revalidateTag('ontong-youth-centers', { expire: 0 });
  revalidatePath('/newsletter');
  revalidatePath('/newsletter/[id]', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
