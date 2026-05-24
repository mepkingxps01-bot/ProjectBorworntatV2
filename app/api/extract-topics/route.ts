import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { extractTopicsFromText } from '@/lib/claude';
import type { StudyResource } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { text, fileName, examTopics } = await req.json() as {
      text: string;
      fileName: string;
      examTopics: string[];
    };

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const topics = await extractTopicsFromText(text, examTopics);

    const resource: StudyResource = {
      id: `resource_${Date.now()}`,
      fileName,
      topics,
      rawText: text.slice(0, 10000),
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({ resource });
  } catch (err) {
    console.error('Topic extraction error:', err);
    return NextResponse.json({ error: 'Failed to extract topics' }, { status: 500 });
  }
}
