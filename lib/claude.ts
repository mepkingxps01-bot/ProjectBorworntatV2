import Anthropic from '@anthropic-ai/sdk';
import type { Topic, StudySession, Enemy, Question } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function extractTopicsFromText(
  text: string,
  examTopics: string[]
): Promise<Topic[]> {
  const truncated = text.slice(0, 80000);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are an ophthalmology education expert. Extract and structure the key topics from this textbook content.

Focus on these exam topics: ${examTopics.join(', ')}

Textbook content:
${truncated}

Return a JSON array of topics. Each topic must have:
- id: unique string (snake_case)
- name: topic name (string)
- content: concise summary of key facts and concepts (200-400 words)
- subtopics: array of subtopic names
- priority: 1-5 (5=most important for exams)

Return ONLY valid JSON, no markdown, no explanation:
[{"id":"...","name":"...","content":"...","subtopics":["..."],"priority":5}]`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as Topic[];
  } catch {
    return [];
  }
}

export async function generateStudyPlan(
  topics: Topic[],
  examDate: string,
  examTopics: string[]
): Promise<StudySession[]> {
  const today = new Date();
  const exam = new Date(examDate);
  const daysUntilExam = Math.max(
    1,
    Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Create a study plan using "Make It Stick" methodology for an ophthalmology resident.

Exam date: ${examDate} (${daysUntilExam} days away)
Topics to cover: ${examTopics.join(', ')}
Available topics from textbook: ${topics.map((t) => t.name).join(', ')}

Make It Stick principles to apply:
- Retrieval practice: quiz sessions 24-48h after initial learning
- Spaced repetition: revisit topics at increasing intervals
- Interleaving: mix different topics in later sessions
- Elaboration: connect concepts across topics

Create one session per day. Return ONLY a JSON array:
[{
  "id": "session_1",
  "date": "YYYY-MM-DD",
  "topicIds": ["topic_id"],
  "method": "learn|review|quiz|interleave",
  "completed": false,
  "xpEarned": 0,
  "description": "Brief description of session goal"
}]

Start dates from today: ${today.toISOString().split('T')[0]}
Last day is exam day — make it a comprehensive review.
Return ONLY valid JSON array.`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as StudySession[];
  } catch {
    return [];
  }
}

export async function generateQuestions(
  topic: Topic,
  count: number = 3
): Promise<Question[]> {
  const contentSnippet = topic.content.slice(0, 1500);
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: `Generate ${count} ophthalmology exam questions about "${topic.name}".
Content: ${contentSnippet}

Return ONLY a JSON array. ${count - 1} MCQ (4 options) and 1 short-answer (crq).
[{"id":"q1","type":"mcq","question":"...","options":["A.","B.","C.","D."],"correctAnswer":"A.","explanation":"...","topic":"${topic.name}","difficulty":2}]`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as Question[];
  } catch {
    return [];
  }
}

export async function evaluateCRQAnswer(
  question: string,
  modelAnswer: string,
  userAnswer: string
): Promise<{ correct: boolean; score: number; feedback: string }> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Evaluate this ophthalmology exam answer.

Question: ${question}
Model answer: ${modelAnswer}
Student answer: ${userAnswer}

Score 0-100. Be lenient if key concepts are mentioned even if wording differs.
Return ONLY valid JSON:
{"correct": true/false, "score": 0-100, "feedback": "Brief encouraging feedback mentioning what was good and what was missed"}

correct=true if score >= 60.`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { correct: false, score: 0, feedback: 'Could not evaluate answer.' };
  }
}

export function createEnemy(topic: Topic, sessionMethod: string): Enemy {
  const enemies: Omit<Enemy, 'id' | 'topic' | 'maxHp' | 'currentHp'>[] = [
    {
      name: 'Cataract Shadow',
      type: 'minion',
      emoji: '🌑',
      description: 'A cloudy specter that blurs your vision',
      attackMessage: 'The shadow clouds your mind with confusion!',
    },
    {
      name: 'Glaucoma Daemon',
      type: 'minion',
      emoji: '⚡',
      description: 'A pressure monster with intraocular spikes',
      attackMessage: 'Pressure builds in your skull!',
    },
    {
      name: 'Retinal Tear Specter',
      type: 'elite',
      emoji: '👁️',
      description: 'A ghostly torn membrane drifting in vitreous',
      attackMessage: 'Your vision flickers as the specter tears through!',
    },
    {
      name: 'Corneal Ulcer Beast',
      type: 'minion',
      emoji: '🦠',
      description: 'A burning bacterial creature',
      attackMessage: 'Burning pain erupts across your cornea!',
    },
    {
      name: 'Papilledema Titan',
      type: 'elite',
      emoji: '🔴',
      description: 'A swollen optic disc giant',
      attackMessage: 'The titan swells with increased cranial pressure!',
    },
    {
      name: 'Macular Phantom',
      type: 'minion',
      emoji: '💜',
      description: 'A central scotoma lurking in the dark',
      attackMessage: 'Your central vision disappears!',
    },
  ];

  const isBoss = sessionMethod === 'interleave';
  const baseEnemy = isBoss
    ? {
        name: 'Final Exam Titan',
        type: 'boss' as const,
        emoji: '💀',
        description: 'The ultimate ophthalmology challenge',
        attackMessage: 'The Titan unleashes a barrage of clinical questions!',
      }
    : enemies[Math.floor(Math.random() * enemies.length)];

  const hpMap = { minion: 100, elite: 200, boss: 400 };

  return {
    id: `enemy_${Date.now()}`,
    topic: topic.name,
    maxHp: hpMap[baseEnemy.type as keyof typeof hpMap],
    currentHp: hpMap[baseEnemy.type as keyof typeof hpMap],
    ...baseEnemy,
  };
}
