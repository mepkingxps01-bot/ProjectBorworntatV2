import { NextRequest, NextResponse } from 'next/server';
import { evaluateCRQAnswer } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { question, modelAnswer, userAnswer } = await req.json() as {
      question: string;
      modelAnswer: string;
      userAnswer: string;
    };

    if (!question || !modelAnswer || !userAnswer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await evaluateCRQAnswer(question, modelAnswer, userAnswer);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Answer evaluation error:', err);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
