'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sword, Calendar, CheckCircle, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import KnowledgeTree from '@/components/tree/KnowledgeTree';
import StaminaBar from '@/components/dashboard/StaminaBar';
import XPBar from '@/components/dashboard/XPBar';
import type { StudySession } from '@/types';

const METHOD_COLORS: Record<string, string> = {
  learn: 'bg-blue-900/60 text-blue-300 border-blue-700',
  review: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  quiz: 'bg-violet-900/60 text-violet-300 border-violet-700',
  interleave: 'bg-red-900/60 text-red-300 border-red-700',
};

const METHOD_ICONS: Record<string, string> = {
  learn: '📖',
  review: '🔄',
  quiz: '⚡',
  interleave: '🌀',
};

export default function DashboardPage() {
  const router = useRouter();
  const {
    xp, level, treeStage, stamina, maxStamina, restUntil, totalStudyMinutes,
    exam, studyPlan, resource, completedSessions, reset,
  } = useGameStore();

  const today = new Date().toISOString().split('T')[0];
  const daysUntilExam = exam
    ? Math.max(0, Math.ceil((new Date(exam.date).getTime() - Date.now()) / 86400000))
    : null;

  const todaySessions = studyPlan?.sessions.filter((s) => s.date === today) ?? [];
  const upcomingSessions = studyPlan?.sessions
    .filter((s) => s.date > today && !completedSessions.includes(s.id))
    .slice(0, 5) ?? [];

  const totalXpAvailable = studyPlan?.sessions.reduce((acc, s) => acc + 50, 0) ?? 0;
  const completedCount = completedSessions.length;
  const totalSessions = studyPlan?.sessions.length ?? 0;

  function startSession(session: StudySession) {
    const canStudy = stamina > 0 && !restUntil;
    if (!canStudy) return;

    const topic = resource?.topics.find((t) => session.topicIds.includes(t.id))
      ?? resource?.topics[0]
      ?? {
          id: 'default',
          name: exam?.topics[0] ?? 'Ophthalmology',
          content: `Key ophthalmology concepts for ${exam?.topics.join(', ')}`,
          priority: 5,
        };

    router.push(`/battle?sessionId=${session.id}&topicId=${topic.id}&method=${session.method}`);
  }

  if (!exam && !studyPlan) {
    return (
      <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center text-center p-6">
        <KnowledgeTree stage={0} xp={0} size="md" />
        <h1 className="text-2xl font-bold text-white mt-8 mb-3">No Quest Active</h1>
        <p className="text-slate-400 mb-6">Set up your study plan to begin your journey.</p>
        <Link href="/setup"
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Begin Setup
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080812] p-4 md:p-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">👁️</span>
          <span className="text-lg font-bold text-white">OphthaQuest</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/setup" className="text-slate-400 hover:text-slate-200 text-sm transition-colors flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> New Quest
          </Link>
          <button onClick={() => { if (confirm('Reset all progress?')) reset(); }}
            className="text-slate-500 hover:text-red-400 text-sm transition-colors flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* Left column: Tree + Stats */}
        <div className="md:col-span-1 space-y-4">
          {/* Exam countdown */}
          {exam && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">{exam.name}</p>
              <p className="text-3xl font-bold text-white">{daysUntilExam}</p>
              <p className="text-slate-400 text-sm">days until exam</p>
              <p className="text-xs text-slate-500 mt-1">{exam.date}</p>
            </div>
          )}

          {/* Knowledge Tree */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col items-center">
            <motion.div
              key={treeStage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <KnowledgeTree stage={treeStage} xp={xp} size="md" />
            </motion.div>
          </div>

          <XPBar xp={xp} level={level} treeStage={treeStage} />
          <StaminaBar stamina={stamina} maxStamina={maxStamina} restUntil={restUntil} />

          {/* Progress summary */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Sessions done</span>
              <span className="text-white font-semibold">{completedCount}/{totalSessions}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{Math.round(totalStudyMinutes / 60 * 10) / 10} hrs studied total</p>
          </div>
        </div>

        {/* Right columns: Quests */}
        <div className="md:col-span-2 space-y-6">

          {/* Today's quests */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" /> Today&apos;s Quests
            </h2>
            {todaySessions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 text-center text-slate-400 text-sm">
                No sessions scheduled today. Check upcoming quests below.
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => {
                  const done = completedSessions.includes(session.id);
                  const canStart = stamina > 0 && !restUntil && !done;
                  return (
                    <motion.div
                      key={session.id}
                      className={`bg-slate-800/60 border rounded-xl p-4 flex items-start gap-4
                        ${done ? 'border-emerald-800/60' : 'border-slate-700'}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border
                        ${done ? 'bg-emerald-900/40 border-emerald-700' : METHOD_COLORS[session.method]}`}>
                        {done ? '✅' : METHOD_ICONS[session.method]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${METHOD_COLORS[session.method]}`}>
                            {session.method}
                          </span>
                          {done && <span className="text-xs text-emerald-400">+{session.xpEarned} XP</span>}
                        </div>
                        <p className="text-sm text-slate-200 font-medium">{session.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{session.topicIds.join(', ')}</p>
                      </div>
                      {!done && (
                        <button
                          onClick={() => startSession(session)}
                          disabled={!canStart}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0
                            ${canStart
                              ? 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-105'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                          <Sword className="w-4 h-4" />
                          {stamina === 0 ? 'No Stamina' : 'Battle!'}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming sessions */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Quests
            </h2>
            {upcomingSessions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 text-center text-slate-400 text-sm">
                All upcoming quests complete!
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div key={session.id}
                    className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-lg">{METHOD_ICONS[session.method]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{session.description}</p>
                      <p className="text-xs text-slate-500">{session.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${METHOD_COLORS[session.method]}`}>
                      {session.method}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick battle */}
          <div className="bg-gradient-to-r from-violet-900/40 to-violet-800/20 border border-violet-700/40 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
              <Sword className="w-5 h-5 text-violet-400" /> Quick Battle
            </h3>
            <p className="text-slate-400 text-sm mb-4">Jump into a battle without a scheduled session.</p>
            <Link
              href="/battle"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${stamina > 0 && !restUntil
                  ? 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-105'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none'}`}
            >
              <Sword className="w-4 h-4" />
              {stamina > 0 && !restUntil ? 'Enter Battle Arena' : 'Stamina Depleted'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
