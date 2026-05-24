'use client';
import { motion } from 'framer-motion';

interface HPBarProps {
  current: number;
  max: number;
  color?: 'red' | 'green' | 'blue';
  label?: string;
  showNumbers?: boolean;
}

const colorMap = {
  red: 'from-red-600 to-red-400',
  green: 'from-green-600 to-green-400',
  blue: 'from-blue-600 to-blue-400',
};

const bgMap = {
  red: 'bg-red-950',
  green: 'bg-green-950',
  blue: 'bg-blue-950',
};

export default function HPBar({
  current,
  max,
  color = 'red',
  label,
  showNumbers = true,
}: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full">
      {(label || showNumbers) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
          {showNumbers && (
            <span className="text-xs text-slate-300 font-mono ml-auto">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full h-4 rounded-full ${bgMap[color]} overflow-hidden border border-slate-700`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
          initial={{ width: '100%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
