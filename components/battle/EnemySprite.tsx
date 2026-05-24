'use client';
import { motion } from 'framer-motion';
import type { Enemy } from '@/types';

interface EnemySpriteProps {
  enemy: Enemy;
  isAttacking?: boolean;
  isDamaged?: boolean;
}

export default function EnemySprite({ enemy, isAttacking, isDamaged }: EnemySpriteProps) {
  const glowColor = {
    minion: '#7c3aed',
    elite: '#dc2626',
    boss: '#f59e0b',
  }[enemy.type];

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="relative flex items-center justify-center"
        animate={
          isAttacking
            ? { x: [-10, 10, -8, 8, 0], transition: { duration: 0.5 } }
            : isDamaged
            ? { x: [0, -20, 20, -10, 10, 0], scale: [1, 0.9, 1.1, 0.95, 1] }
            : { y: [0, -8, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
        }
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"
          style={{ background: glowColor }}
        />

        {/* Enemy emoji sprite */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full border-2"
          style={{
            width: enemy.type === 'boss' ? 120 : enemy.type === 'elite' ? 96 : 80,
            height: enemy.type === 'boss' ? 120 : enemy.type === 'elite' ? 96 : 80,
            borderColor: glowColor,
            background: 'rgba(0,0,0,0.6)',
            boxShadow: `0 0 20px ${glowColor}80`,
            fontSize: enemy.type === 'boss' ? 56 : enemy.type === 'elite' ? 44 : 36,
          }}
        >
          {enemy.emoji}
        </div>

        {/* Boss crown */}
        {enemy.type === 'boss' && (
          <div className="absolute -top-6 text-2xl">👑</div>
        )}
      </motion.div>

      <div className="text-center">
        <p className="font-bold text-white text-lg">{enemy.name}</p>
        <p className="text-xs text-slate-400">{enemy.description}</p>
      </div>
    </div>
  );
}
