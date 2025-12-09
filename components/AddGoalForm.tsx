import React, { useState } from 'react';

interface AddGoalFormProps {
  onSubmit: (name: string, targetDays: number) => void;
  onCancel: () => void;
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('21');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const days = parseInt(target, 10);
    if (isNaN(days) || days < 1) return;
    onSubmit(name, days);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Forge a New Chain</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 10 pages, No Sugar..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Target Duration (Days)</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[7, 21, 66, 90].map(val => (
                <button 
                    type="button"
                    key={val}
                    onClick={() => setTarget(val.toString())}
                    className={`py-2 rounded-md text-sm font-medium transition-colors ${
                        target === val.toString() 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    {val} Days
                </button>
            ))}
          </div>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            min="1"
            max="365"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
          >
            Start Chain
          </button>
        </div>
      </form>
    </div>
  );
};
