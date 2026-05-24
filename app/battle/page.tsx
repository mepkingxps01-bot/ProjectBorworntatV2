'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Heart, Trophy, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import EnemySprite from '@/components/battle/EnemySprite';
import QuestionCard from '@/components/battle/QuestionCard';
import HPBar from '@/components/battle/HPBar';
import KnowledgeTree from '@/components/tree/KnowledgeTree';
import type { Battle, Topic, Question, Enemy } from '@/types';

const PLAYER_MAX_HP = 100;
const DAMAGE_CORRECT = 25;
const DAMAGE_WRONG = 15;

function BattleContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('sessionId');
  const topicId = params.get('topicId');
  const method = params.get('method') ?? 'quiz';

  const { resource, exam, treeStage, xp, stamina, endBattle, tickStamina, startRest, startSession } = useGameStore();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpGained, setXpGained] = useState(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const [flashDamage, setFlashDamage] = useState(false);
  const [message, setMessage] = useState('');

  const topic: Topic | null =
    resource?.topics.find((t) => t.id === topicId) ??
    resource?.topics[0] ??
    (exam?.topics[0]
      ? { id: 'default', name: exam.topics[0], content: `Ophthalmology concepts for ${exam.topics[0]}`, priority: 5 }
      : null);

  const initBattle = useCallback(async () => {
    if (!topic) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sessionMethod: method, count: 5 }),
      });
      const data = await res.json();
      const enemy: Enemy = data.enemy;
      const questions: Question[] = data.questions ?? [];

      setBattle({
        id: `battle_${Date.now()}`,
        enemy,
        questions,
        currentQuestionIndex: 0,
        playerHp: PLAYER_MAX_HP,
        playerMaxHp: PLAYER_MAX_HP,
        phase: 'intro',
      });
      if (sessionId) startSession(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [topic, method, sessionId, startSession]);

  useEffect(() => { initBattle(); }, [initBattle]);

  // Stamina ticker
  useEffect(() => {
    const interval = setInterval(() => {
      tickStamina(1);
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [tickStamina]);

  function handleAnswer(answer: string, correct: boolean) {
    if (!battle || battle.phase !== 'question') return;

    const updatedBattle = { ...battle };

    if (correct) {
      const dmg = DAMAGE_CORRECT;
      updatedBattle.enemy = {
        ...updatedBattle.enemy,
        currentHp: Math.max(0, updatedBattle.enemy.currentHp - dmg),
      };
      const gained = 20 + (battle.questions[battle.currentQuestionIndex].difficulty * 10);
      setXpGained((prev) => prev + gained);
      setMessage(`✅ Correct! -${dmg} HP to ${battle.enemy.name}`);
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 1500);
    } else {
      updatedBattle.playerHp = Math.max(0, updatedBattle.playerHp - DAMAGE_WRONG);
      setFlashDamage(true);
      setTimeout(() => setFlashDamage(false), 500);
      setMessage(`❌ ${battle.enemy.attackMessage}`);
    }

    setTimeout(() => {
      const isEnemyDead = updatedBattle.enemy.currentHp <= 0;
      const isPlayerDead = updatedBattle.playerHp <= 0;
      const isLastQuestion = battle.currentQuestionIndex >= battle.questions.length - 1;

      if (isEnemyDead || (isLastQuestion && !isPlayerDead)) {
        updatedBattle.phase = 'victory';
      } else if (isPlayerDead) {
        updatedBattle.phase = 'defeat';
      } else {
        updatedBattle.currentQuestionIndex = battle.currentQuestionIndex + 1;
        updatedBattle.phase = 'question';
        setMessage('');
      }
      setBattle(updatedBattle);
    }, 1200);
  }

  function handleVictoryEnd() {
    const totalXp = xpGained;
    endBattle(totalXp, sessionId ?? undefined);
    if (stamina <= 10) {
      startRest();
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-bounce">⚔️</div>
        <p className="text-slate-300 font-medium">Summoning your enemy...</p>
        <p className="text-slate-500 text-sm">Generating battle questions with AI</p>
      </div>
    );
  }

  if (!topic || !battle) {
    return (
      <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">No Topic Found</h2>
        <p className="text-slate-400">Please set up your study resources first.</p>
        <button onClick={() => router.push('/setup')}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold">
          Go to Setup
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#080812] flex flex-col ${flashDamage ? 'damage-flash' : ''}`}>
      {/* Fixed top bar */}
      <div className="sticky top-0 z-20 bg-[#080812]/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <Heart className="w-4 h-4 text-red-400 shrink-0" />
            <div className="flex-1">
              <HPBar current={battle.playerHp} max={PLAYER_MAX_HP} color="green" showNumbers={false} />
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">{battle.playerHp} HP</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-mono">{stamina}m</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Topic badge */}
        <div className="text-center">
          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
            ⚔️ Topic: {topic.name}
          </span>
        </div>

        {/* Enemy section */}
        <div className="text-center space-y-4">
          <AnimatePresence>
            {battle.phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <EnemySprite enemy={battle.enemy} />
                <div className="mt-4">
                  <HPBar current={battle.enemy.currentHp} max={battle.enemy.maxHp} color="red" label="Enemy HP" />
                </div>
                <button
                  onClick={() => setBattle({ ...battle, phase: 'question' })}
                  className="mt-6 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-red-900/40">
                  ⚔️ Begin Battle!
                </button>
              </motion.div>
            )}

            {(battle.phase === 'question' || message) && battle.phase !== 'intro' && battle.phase !== 'victory' && battle.phase !== 'defeat' && (
              <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EnemySprite enemy={battle.enemy} isDamaged={false} />
                <div className="mt-4">
                  <HPBar current={battle.enemy.currentHp} max={battle.enemy.maxHp} color="red" label="Enemy HP" />
                </div>
              </motion.div>
            )}

            {battle.phase === 'victory' && (
              <motion.div key="victory"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-6xl animate-bounce">🏆</div>
                <h2 className="text-2xl font-bold text-yellow-400">Victory!</h2>
                <p className="text-slate-300">You defeated {battle.enemy.name}!</p>
                <div className="bg-yellow-900/40 border border-yellow-700/60 rounded-xl px-6 py-4 text-center">
                  <p className="text-yellow-400 text-2xl font-bold">+{xpGained} XP</p>
                  <p className="text-yellow-300/70 text-sm">Your tree grows stronger...</p>
                </div>
                <KnowledgeTree stage={treeStage} xp={xp} size="sm" />
                <button onClick={handleVictoryEnd}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl transition-all hover:scale-105">
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Claim Reward
                </button>
              </motion.div>
            )}

            {battle.phase === 'defeat' && (
              <motion.div key="defeat"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-6xl">💀</div>
                <h2 className="text-2xl font-bold text-red-400">Defeated!</h2>
                <p className="text-slate-300">The enemy was too strong this time...</p>
                <p className="text-slate-400 text-sm">Rest and come back stronger.</p>
                <div className="flex gap-3">
                  <button onClick={initBattle}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                    Try Again
                  </button>
                  <button onClick={() => router.push('/dashboard')}
                    className="border border-slate-600 text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors">
                    Retreat
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message flash */}
        {message && battle.phase === 'question' && (
          <motion.div
            key={message}
            className="text-center text-sm font-medium py-2 px-4 bg-slate-800 rounded-lg border border-slate-700 text-slate-200"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {message}
          </motion.div>
        )}

        {/* XP pop */}
        {showXpPop && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none xp-pop">
            <span className="text-yellow-400 text-2xl font-bold drop-shadow-lg">+XP!</span>
          </div>
        )}

        {/* Question */}
        {battle.phase === 'question' && battle.questions[battle.currentQuestionIndex] && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Question {battle.currentQuestionIndex + 1} of {battle.questions.length}</span>
              <span>{battle.questions[battle.currentQuestionIndex].topic}</span>
            </div>
            <QuestionCard
              question={battle.questions[battle.currentQuestionIndex]}
              onAnswer={handleAnswer}
            />
          </div>
        )}

        {/* Stamina warning */}
        {stamina <= 15 && stamina > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-3 text-center">
            <p className="text-yellow-400 text-sm font-medium">⚡ Stamina low! {stamina} minutes remaining.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <div className="text-4xl animate-bounce">⚔️</div>
      </div>
    }>
      <BattleContent />
    </Suspense>
  );
}
