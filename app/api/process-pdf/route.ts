import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import * as pdfParseModule from 'pdf-parse';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = (pdfParseModule as any).default ?? pdfParseModule;
import { extractTopicsFromText } from '@/lib/claude';
import type { StudyResource } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const topicsRaw = formData.get('topics') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const examTopics = topicsRaw ? JSON.parse(topicsRaw) : [];

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text;

    const topics = await extractTopicsFromText(rawText, examTopics);

    const resource: StudyResource = {
      id: `resource_${Date.now()}`,
      fileName: file.name,
      topics,
      rawText: rawText.slice(0, 10000),
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({ resource });
  } catch (err) {
    console.error('PDF processing error:', err);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
