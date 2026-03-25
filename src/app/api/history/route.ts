import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prompts } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const history = await db.query.prompts.findMany({
        where: eq(prompts.userId, session.user.id),
        orderBy: [desc(prompts.createdAt)],
    });

    return NextResponse.json(history);
}

export async function DELETE(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.delete(prompts).where(eq(prompts.id, id));
    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const newPrompt = await db.insert(prompts).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        rawInput: data.rawInput,
        finalPrompt: data.finalPrompt,
        draftJson: data.draftJson,
        confidence: data.confidence,
        iterationCount: data.iterationCount,
        createdAt: new Date(),
    }).returning();

    return NextResponse.json(newPrompt[0]);
}
