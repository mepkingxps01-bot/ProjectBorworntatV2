'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export default function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [crqAnswer, setCrqAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  async function handleMCQ(option: string) {
    if (disabled || selected) return;
    setSelected(option);
    const correct = option === question.correctAnswer;
    setTimeout(() => onAnswer(option, correct), 600);
  }

  async function handleCRQ() {
    if (!crqAnswer.trim() || evaluating || disabled) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          modelAnswer: question.correctAnswer,
          userAnswer: crqAnswer,
        }),
      });
      const data = await res.json();
      onAnswer(crqAnswer, data.correct ?? false);
    } catch {
      onAnswer(crqAnswer, false);
    } finally {
      setEvaluating(false);
    }
  }

  const difficultyLabel = ['', 'Basic', 'Intermediate', 'Advanced'][question.difficulty];
  const difficultyColor = ['', 'text-green-400', 'text-yellow-400', 'text-red-400'][question.difficulty];

  return (
    <motion.div
      className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded-2xl p-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs bg-violet-900 text-violet-300 px-2 py-1 rounded-full font-medium">
          {question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
        </span>
        <span className={`text-xs font-medium ${difficultyColor}`}>{difficultyLabel}</span>
      </div>

      <p className="text-white font-medium text-base mb-6 leading-relaxed">
        {question.question}
      </p>

      {question.type === 'mcq' ? (
        <div className="grid gap-3">
          {question.options?.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = selected && opt === question.correctAnswer;
            const isWrong = isSelected && opt !== question.correctAnswer;
            return (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                disabled={!!selected || disabled}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all
                  ${isCorrect ? 'bg-green-900 border-green-500 text-green-300' : ''}
                  ${isWrong ? 'bg-red-900 border-red-500 text-red-300' : ''}
                  ${!isSelected && !selected ? 'border-slate-600 text-slate-200 hover:border-violet-500 hover:bg-violet-900/30 cursor-pointer' : ''}
                  ${!isSelected && selected ? 'border-slate-700 text-slate-500' : ''}
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={crqAnswer}
            onChange={(e) => setCrqAnswer(e.target.value)}
            disabled={evaluating || disabled}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
          />
          <button
            onClick={handleCRQ}
            disabled={!crqAnswer.trim() || evaluating || disabled}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {evaluating ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
