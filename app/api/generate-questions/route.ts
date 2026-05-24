import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { generateQuestions, createEnemy } from '@/lib/claude';
import type { Topic } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { topic, sessionMethod, count } = await req.json() as {
      topic: Topic;
      sessionMethod: string;
      count?: number;
    };

    if (!topic) {
      return NextResponse.json({ error: 'No topic provided' }, { status: 400 });
    }

    const [questions, enemy] = await Promise.all([
      generateQuestions(topic, count ?? 5),
      Promise.resolve(createEnemy(topic, sessionMethod ?? 'quiz')),
    ]);

    return NextResponse.json({ questions, enemy });
  } catch (err) {
    console.error('Question generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
