'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeTreeProps {
  stage: number;
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

const STAGE_LABELS = [
  'Seed',
  'Sprout',
  'Seedling',
  'Sapling',
  'Young Tree',
  'Growing Tree',
  'Mature Tree',
  'Ancient Tree',
  'Wise Tree',
  'Knowledge Tree',
];

const STAGE_COLORS = [
  '#8B4513',
  '#4ade80',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
  '#065f46',
  '#f59e0b',
  '#fbbf24',
];

export default function KnowledgeTree({ stage, xp, size = 'md' }: KnowledgeTreeProps) {
  const s = Math.min(9, Math.max(0, stage));
  const color = STAGE_COLORS[s];
  const isGlowing = s >= 7;
  const isGolden = s >= 8;

  const dimensions = { sm: 120, md: 220, lg: 340 }[size];
  const d = dimensions;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: d, height: d }}>
        {isGlowing && (
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse"
            style={{ background: isGolden ? '#f59e0b' : '#22c55e' }}
          />
        )}
        <svg
          viewBox="0 0 100 100"
          width={d}
          height={d}
          className="relative z-10"
        >
          {/* Ground */}
          <ellipse cx="50" cy="92" rx="30" ry="5" fill="#1a1a2e" opacity="0.6" />

          {/* Stage 0: Seed */}
          {s === 0 && (
            <motion.ellipse
              cx="50" cy="88" rx="6" ry="4"
              fill="#8B4513"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            />
          )}

          {/* Stage 1+: Trunk */}
          {s >= 1 && (
            <motion.rect
              x="47" y={90 - Math.min(s * 10, 60)} width="6" height={Math.min(s * 10, 60)}
              fill="#6b3a1f"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: '50px 90px' }}
            />
          )}

          {/* Stage 1: Sprout */}
          {s === 1 && (
            <>
              <motion.ellipse cx="40" cy="78" rx="7" ry="4" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              <motion.ellipse cx="60" cy="76" rx="7" ry="4" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            </>
          )}

          {/* Stage 2: Seedling */}
          {s === 2 && (
            <motion.ellipse cx="50" cy="68" rx="14" ry="10" fill={color}
              initial={{ scale: 0 }} animate={{ scale: 1 }} />
          )}

          {/* Stage 3: Sapling */}
          {s === 3 && (
            <>
              <motion.ellipse cx="50" cy="62" rx="16" ry="12" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="38" cy="70" rx="10" ry="7" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} />
              <motion.ellipse cx="62" cy="70" rx="10" ry="7" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            </>
          )}

          {/* Stage 4: Young Tree */}
          {s === 4 && (
            <>
              <motion.ellipse cx="50" cy="55" rx="20" ry="15" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="35" cy="65" rx="13" ry="9" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="65" cy="65" rx="13" ry="9" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              <motion.ellipse cx="50" cy="72" rx="10" ry="7" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            </>
          )}

          {/* Stage 5: Growing Tree */}
          {s === 5 && (
            <>
              <motion.ellipse cx="50" cy="48" rx="24" ry="18" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="32" cy="60" rx="16" ry="11" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="68" cy="60" rx="16" ry="11" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              <motion.ellipse cx="50" cy="70" rx="14" ry="9" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            </>
          )}

          {/* Stage 6: Mature Tree */}
          {s === 6 && (
            <>
              <motion.ellipse cx="50" cy="42" rx="28" ry="22" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="28" cy="55" rx="18" ry="13" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="72" cy="55" rx="18" ry="13" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              <motion.ellipse cx="50" cy="65" rx="16" ry="11" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
            </>
          )}

          {/* Stage 7: Ancient Tree */}
          {s === 7 && (
            <>
              <motion.ellipse cx="50" cy="38" rx="32" ry="26" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="24" cy="52" rx="20" ry="15" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="76" cy="52" rx="20" ry="15" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} />
              <motion.ellipse cx="50" cy="62" rx="18" ry="13" fill={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              {/* Highlights */}
              <ellipse cx="42" cy="34" rx="8" ry="6" fill="#166534" opacity="0.6" />
              <ellipse cx="60" cy="36" rx="7" ry="5" fill="#166534" opacity="0.6" />
            </>
          )}

          {/* Stage 8: Wise Tree - golden tinge */}
          {s === 8 && (
            <>
              <motion.ellipse cx="50" cy="35" rx="34" ry="28" fill="#15803d"
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="22" cy="50" rx="22" ry="17" fill="#16a34a"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="78" cy="50" rx="22" ry="17" fill="#16a34a"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} />
              <motion.ellipse cx="50" cy="62" rx="20" ry="14" fill="#16a34a"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              {/* Golden leaves */}
              {[20, 35, 50, 65, 80].map((cx, i) => (
                <motion.circle key={i} cx={cx} cy={25 + (i % 2) * 8} r="4"
                  fill="#f59e0b"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ delay: i * 0.15, duration: 2, repeat: Infinity }}
                />
              ))}
            </>
          )}

          {/* Stage 9: Knowledge Tree - full golden */}
          {s === 9 && (
            <>
              <motion.ellipse cx="50" cy="32" rx="36" ry="30" fill="#f59e0b"
                initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.ellipse cx="20" cy="48" rx="24" ry="18" fill="#fbbf24"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
              <motion.ellipse cx="80" cy="48" rx="24" ry="18" fill="#fbbf24"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} />
              <motion.ellipse cx="50" cy="60" rx="22" ry="15" fill="#f59e0b"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
              {/* Sparkles */}
              {[15, 28, 42, 58, 72, 85].map((cx, i) => (
                <motion.polygon key={i}
                  points={`${cx},${10 + (i % 3) * 8} ${cx + 3},${16 + (i % 3) * 8} ${cx + 6},${10 + (i % 3) * 8} ${cx + 3},${4 + (i % 3) * 8}`}
                  fill="#fff"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {size !== 'sm' && (
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color }}>{STAGE_LABELS[s]}</p>
          <p className="text-xs text-slate-400">{xp} XP</p>
        </div>
      )}
    </div>
  );
}
