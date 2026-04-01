import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const startTime = Date.now();
  try {
    const user = await prisma.user.findFirst();
    const duration = Date.now() - startTime;
    return NextResponse.json({ success: true, email: user?.email, duration });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    return NextResponse.json({ 
      success: false, 
      error: err?.message, 
      stack: err?.stack,
      clientVersion: err?.clientVersion,
      code: err?.code,
      meta: err?.meta,
      duration
    });
  }
}
