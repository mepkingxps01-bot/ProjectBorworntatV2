'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { XP_TABLE } from '@/store/game-store';

interface XPBarProps {
  xp: number;
  level: number;
  treeStage: number;
}

export default function XPBar({ xp, level, treeStage }: XPBarProps) {
  const currentLevelXp = XP_TABLE[treeStage] ?? 0;
  const nextLevelXp = XP_TABLE[treeStage + 1] ?? XP_TABLE[XP_TABLE.length - 1];
  const progress = nextLevelXp > currentLevelXp
    ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    : 100;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-semibold text-slate-200">Level {level}</span>
        <span className="ml-auto text-xs text-yellow-400 font-mono">{xp} XP</span>
      </div>

      <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-400">{xp - currentLevelXp} / {nextLevelXp - currentLevelXp} to next</span>
        {treeStage < 9 && (
          <span className="text-xs text-slate-500">{nextLevelXp - xp} XP needed</span>
        )}
        {treeStage >= 9 && (
          <span className="text-xs text-yellow-400">Max Level!</span>
        )}
      </div>
    </div>
  );
}
