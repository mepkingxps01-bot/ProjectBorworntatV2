export interface Topic {
  id: string;
  name: string;
  content: string;
  subtopics?: string[];
  priority: number;
}

export interface StudyResource {
  id: string;
  fileName: string;
  topics: Topic[];
  rawText: string;
  processedAt: string;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  topics: string[];
}

export interface StudySession {
  id: string;
  date: string;
  topicIds: string[];
  method: 'learn' | 'review' | 'quiz' | 'interleave';
  completed: boolean;
  xpEarned: number;
  description: string;
}

export interface StudyPlan {
  examId: string;
  sessions: StudySession[];
  createdAt: string;
}

export type EnemyType = 'minion' | 'elite' | 'boss';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHp: number;
  currentHp: number;
  topic: string;
  emoji: string;
  description: string;
  attackMessage: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'crq';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 1 | 2 | 3;
}

export interface Battle {
  id: string;
  enemy: Enemy;
  questions: Question[];
  currentQuestionIndex: number;
  playerHp: number;
  playerMaxHp: number;
  phase: 'intro' | 'question' | 'result' | 'victory' | 'defeat';
  lastAnswerCorrect?: boolean;
  lastExplanation?: string;
}

export interface GameState {
  xp: number;
  level: number;
  treeStage: number;
  stamina: number;
  maxStamina: number;
  totalStudyMinutes: number;
  sessionStartTime: number | null;
  restUntil: number | null;
  resource: StudyResource | null;
  exam: Exam | null;
  studyPlan: StudyPlan | null;
  currentBattle: Battle | null;
  currentSessionId: string | null;
  completedSessions: string[];
}
