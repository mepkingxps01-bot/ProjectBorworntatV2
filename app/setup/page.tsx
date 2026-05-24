'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Calendar, Tag, Loader2, CheckCircle, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import type { StudyPlan } from '@/types';

const SUGGESTED_TOPICS = [
  'Glaucoma', 'Cataract', 'Retina', 'Cornea', 'Neuro-ophthalmology',
  'Strabismus', 'Uvea', 'Ocular Adnexa', 'Refractive Error', 'Optics',
  'Pediatric Ophthalmology', 'Vitreoretinal', 'Ocular Pharmacology',
];

export default function SetupPage() {
  const router = useRouter();
  const { setResource, setExam, setStudyPlan } = useGameStore();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
  }, []);

  function toggleTopic(t: string) {
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function addCustomTopic() {
    const t = customTopic.trim();
    if (t && !topics.includes(t)) {
      setTopics((prev) => [...prev, t]);
      setCustomTopic('');
    }
  }

  async function handleGenerate() {
    if (!examDate || topics.length === 0) return;
    setLoading(true);
    setError('');

    try {
      let resource = null;

      if (file) {
        setLoadingMsg('Reading your textbook... 📖');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('topics', JSON.stringify(topics));
        const res = await fetch('/api/process-pdf', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('PDF processing failed');
        const data = await res.json();
        resource = data.resource;
        setResource(resource);
      }

      const examData = {
        id: `exam_${Date.now()}`,
        name: examName || 'Ophthalmology Exam',
        date: examDate,
        topics,
      };
      setExam(examData);

      setLoadingMsg('Crafting your Make It Stick study plan... 🧠');
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: resource?.topics ?? topics.map((t, i) => ({
            id: `topic_${i}`,
            name: t,
            content: `Key concepts in ${t} for ophthalmology board exams`,
            priority: 5,
          })),
          examDate,
          examTopics: topics,
        }),
      });

      if (!planRes.ok) throw new Error('Plan generation failed');
      const planData = await planRes.json();

      const plan: StudyPlan = {
        examId: examData.id,
        sessions: planData.sessions,
        createdAt: new Date().toISOString(),
      };
      setStudyPlan(plan);

      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please check your API key and try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-xl mb-8">
        <a href="/" className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 mb-6">
          ← Back to home
        </a>
        <h1 className="text-3xl font-bold text-white mb-2">Setup Your Quest</h1>
        <p className="text-slate-400">Complete 3 steps to generate your personalized study plan.</p>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${s < step ? 'bg-emerald-600 text-white' : s === step ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${s < step ? 'bg-emerald-600' : 'bg-slate-700'}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-slate-500">Step {step} of 3</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Upload PDF */}
          {step === 1 && (
            <motion.div key="step1"
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold text-white mb-1">Upload Your Textbook</h2>
              <p className="text-slate-400 text-sm mb-6">Upload a PDF ophthalmology textbook. Optional — you can skip and use topics only.</p>

              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('pdf-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                  ${dragOver ? 'border-violet-500 bg-violet-900/20' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/20'}
                  ${file ? 'border-emerald-600 bg-emerald-900/10' : ''}`}
              >
                <input id="pdf-input" type="file" accept=".pdf" className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                    <p className="text-emerald-400 font-medium">{file.name}</p>
                    <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-slate-500" />
                    <p className="text-slate-300 font-medium">Drop PDF here or click to browse</p>
                    <p className="text-slate-500 text-sm">Max 50MB</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {file ? 'Continue' : 'Skip — Use Topics Only'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Exam Info */}
          {step === 2 && (
            <motion.div key="step2"
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold text-white mb-1">Exam Details</h2>
              <p className="text-slate-400 text-sm mb-6">When is your exam and what topics will be covered?</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 font-medium mb-2 block">Exam Name (optional)</label>
                  <input value={examName} onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Board Exam Part 1"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm" />
                </div>

                <div>
                  <label className="text-sm text-slate-300 font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Exam Date *
                  </label>
                  <input type="date" value={examDate} min={today} onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 text-sm" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setStep(3)} disabled={!examDate}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Topics */}
          {step === 3 && (
            <motion.div key="step3"
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold text-white mb-1">Select Topics</h2>
              <p className="text-slate-400 text-sm mb-6">Choose the ophthalmology topics on your exam.</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTED_TOPICS.map((t) => (
                  <button key={t} onClick={() => toggleTopic(t)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                      ${topics.includes(t)
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-violet-500 hover:text-violet-300'}`}>
                    {topics.includes(t) && '✓ '}{t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                  placeholder="Add custom topic..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm" />
                <button onClick={addCustomTopic}
                  className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors">
                  <Tag className="w-4 h-4" />
                </button>
              </div>

              {topics.length > 0 && (
                <p className="text-xs text-emerald-400 mb-4">{topics.length} topic{topics.length > 1 ? 's' : ''} selected</p>
              )}

              {error && <p className="text-sm text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={handleGenerate} disabled={topics.length === 0 || loading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {loadingMsg || 'Generating...'}
                    </>
                  ) : (
                    <> Generate My Quest Plan ✨ </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
