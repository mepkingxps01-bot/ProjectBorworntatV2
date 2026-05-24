import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  if (!key.startsWith('sk-ant-')) {
    return NextResponse.json({ ok: false, error: `Key format wrong — starts with: ${key.slice(0, 10)}` }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    });
    return NextResponse.json({ ok: true, response: msg.content[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
