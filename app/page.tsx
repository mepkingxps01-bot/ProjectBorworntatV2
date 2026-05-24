'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Sword, TreePine, Clock, Brain, Trophy } from 'lucide-react';
import KnowledgeTree from '@/components/tree/KnowledgeTree';

const features = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Upload Your Textbook',
    desc: 'Upload any ophthalmology PDF. Our AI extracts and structures every key concept.',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'Make It Stick Study Plan',
    desc: 'Spaced repetition, retrieval practice, and interleaving — science-backed scheduling until exam day.',
  },
  {
    icon: <Sword className="w-5 h-5" />,
    title: 'Battle Enemies',
    desc: 'Face ophthalmology monsters. Answer MCQ and clinical questions to deal damage and defeat them.',
  },
  {
    icon: <TreePine className="w-5 h-5" />,
    title: 'Grow Your Tree',
    desc: 'Your Knowledge Tree grows through 10 stages as you earn XP — from Seed to the legendary Knowledge Tree.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Stamina System',
    desc: 'Study in focused 2.5-hour blocks. Rest, recover, and come back stronger for the next battle.',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: 'Boss Battles',
    desc: 'After 5 hours of total study, a Boss appears. Defeat it for massive XP bonuses.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080812] relative overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-900/15 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👁️</span>
          <span className="text-xl font-bold text-white">OphthaQuest</span>
        </div>
        <Link
          href="/setup"
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Begin Journey
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Built for Ophthalmology Residents
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Learn Ophthalmology
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">
              Like an RPG
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Upload your textbook, set your exam date, and battle your way to mastery.
            Science-backed study methods wrapped in a game that makes learning addictive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/setup"
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
            >
              Start Your Journey →
            </Link>
            <Link
              href="/dashboard"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Tree showcase */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[0, 3, 6, 9].map((stage) => (
            <div key={stage} className="flex flex-col items-center">
              <KnowledgeTree stage={stage} xp={0} size="sm" />
            </div>
          ))}
        </motion.div>
        <p className="text-slate-500 text-sm mt-4">Your tree grows as you learn</p>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          Everything You Need to Pass
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-violet-600/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-violet-900/60 rounded-xl flex items-center justify-center text-violet-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center pb-24 px-6">
        <div className="bg-gradient-to-r from-violet-900/40 to-emerald-900/30 border border-violet-700/30 rounded-3xl p-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Level Up?</h2>
          <p className="text-slate-400 mb-8">Upload your ophthalmology textbook and start your journey today.</p>
          <Link
            href="/setup"
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 inline-block"
          >
            Begin Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
}
