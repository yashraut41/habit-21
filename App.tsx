import React, { useState, useEffect } from 'react';
import { Plus, Flame } from 'lucide-react';
import { Goal, GoalLog, WeightLog } from './types';
import { getLocalDateString, calculateStreaks } from './utils/dateUtils';
import { Modal } from './components/Modal';
import { WeightTracker } from './components/WeightTracker/WeightTracker';

// --- Components defined internally for simplicity of the single-file output structure requested in prompt nuances, 
// though typically would be separate. I will separate major ones if they get too large, but for this scale, 
// keeping tight coupling in App or adjacent files is efficient.
// I will adhere to the "components/" folder structure for the main UI pieces as per instructions.

import { GoalCard } from './components/GoalCard';
import { AddGoalForm } from './components/AddGoalForm';
import { EmptyState } from './components/EmptyState';

const App: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<GoalLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  // --- 1. Load Data & Initial Strict Reset Check ---
  useEffect(() => {
    const storedGoals = localStorage.getItem('chains_goals');
    const storedLogs = localStorage.getItem('chains_logs');
    const storedWeights = localStorage.getItem('chains_weight_logs');

    let parsedGoals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];
    const parsedLogs: GoalLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    const parsedWeights: WeightLog[] = storedWeights ? JSON.parse(storedWeights) : [];

    // STRICT STREAK RESET LOGIC
    // We process goals immediately upon load to ensure streaks are accurate relative to "now"
    const todayStr = getLocalDateString(new Date());

    parsedGoals = parsedGoals.map(goal => {
      const { needsReset } = calculateStreaks(goal, todayStr);
      if (needsReset) {
        return { ...goal, currentStreak: 0 };
      }
      return goal;
    });

    setGoals(parsedGoals);
    setLogs(parsedLogs);
    setWeightLogs(parsedWeights);

    // Save the potentially reset goals back immediately
    localStorage.setItem('chains_goals', JSON.stringify(parsedGoals));
  }, []);

  // --- 2. Persist Data on Change ---
  useEffect(() => {
    if (goals.length > 0 || logs.length > 0) {
      localStorage.setItem('chains_goals', JSON.stringify(goals));
      localStorage.setItem('chains_logs', JSON.stringify(logs));
    }
    if (weightLogs.length > 0) {
      localStorage.setItem('chains_weight_logs', JSON.stringify(weightLogs));
    }
  }, [goals, logs, weightLogs]);



  // --- 3. Actions ---

  const handleAddGoal = (name: string, targetDays: number) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name,
      targetDays,
      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDate: null,
      isActive: true,
      createdAt: getLocalDateString(new Date())
    };
    setGoals(prev => [newGoal, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this chain? This cannot be undone.')) {
      setGoals(prev => prev.filter(g => g.id !== id));
      setLogs(prev => prev.filter(l => l.goalId !== id));
    }
  };

  const handleCheckIn = (goalId: string) => {
    const todayStr = getLocalDateString(new Date());

    // update logs
    const newLog: GoalLog = {
      goalId,
      date: todayStr,
      status: 'completed'
    };

    setLogs(prev => [...prev, newLog]);

    // update goal state
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;

      const newCurrentStreak = goal.currentStreak + 1;
      const newBestStreak = Math.max(goal.bestStreak, newCurrentStreak);

      return {
        ...goal,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCheckInDate: todayStr
      };
    }));
  };

  const handleAddWeight = (weight: number, date: string) => {
    const newLog: WeightLog = {
      id: crypto.randomUUID(),
      date,
      weight
    };

    // Check if log already exists for this date, if so update it
    setWeightLogs(prev => {
      const exists = prev.find(l => l.date === date);
      if (exists) {
        return prev.map(l => l.date === date ? { ...l, weight } : l);
      }
      return [...prev, newLog];
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-3">
              <Flame className="w-5 h-5 text-slate-900 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Chain<span className="text-emerald-500">Breaker</span>
            </h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors shadow-lg shadow-emerald-900/20"
            aria-label="Add Habit"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <WeightTracker logs={weightLogs} onAddLog={handleAddWeight} />

        {goals.length === 0 ? (
          <EmptyState onAdd={() => setIsAddModalOpen(true)} />
        ) : (
          goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              logs={logs.filter(l => l.goalId === goal.id)}
              onCheckIn={() => handleCheckIn(goal.id)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))
        )}
      </main>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddGoalForm onSubmit={handleAddGoal} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Simple Footer/Disclaimer */}
      <footer className="text-center text-slate-600 text-xs py-8 px-4">
        <p>Data stored locally in your browser. Clearing cache will remove your streaks.</p>
      </footer>
    </div>
  );
};

export default App;
