import { NextRequest, NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/claude';
import type { Topic } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { topics, examDate, examTopics } = await req.json() as {
      topics: Topic[];
      examDate: string;
      examTopics: string[];
    };

    if (!topics || !examDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessions = await generateStudyPlan(topics, examDate, examTopics);

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Plan generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}
