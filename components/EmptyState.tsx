import React from 'react';
import { Link } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/50">
        <Link className="w-10 h-10 text-slate-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">No Chains Active</h2>
      <p className="text-slate-400 max-w-xs mb-8">
        Success is built one link at a time. Start your first habit chain today.
      </p>
      <button
        onClick={onAdd}
        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1"
      >
        Create First Goal
      </button>
    </div>
  );
};
