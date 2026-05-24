'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface StaminaBarProps {
  stamina: number;
  maxStamina: number;
  restUntil: number | null;
}

export default function StaminaBar({ stamina, maxStamina, restUntil }: StaminaBarProps) {
  const pct = (stamina / maxStamina) * 100;
  const isResting = restUntil !== null && Date.now() < restUntil;
  const restMinsLeft = isResting
    ? Math.ceil((restUntil! - Date.now()) / 60000)
    : 0;

  const color =
    pct > 60 ? 'from-green-500 to-emerald-400' :
    pct > 30 ? 'from-yellow-500 to-amber-400' :
    'from-red-600 to-red-400';

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-slate-200">Stamina</span>
        {isResting && (
          <span className="ml-auto text-xs text-blue-400 animate-pulse">
            Resting... {restMinsLeft}m left
          </span>
        )}
      </div>

      <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-400">{Math.round(stamina)} min left</span>
        <span className="text-xs text-slate-500">{maxStamina} min max</span>
      </div>

      {stamina === 0 && !isResting && (
        <p className="text-xs text-red-400 mt-2 font-medium">
          Stamina depleted — take a 30 min rest before continuing!
        </p>
      )}
    </div>
  );
}
