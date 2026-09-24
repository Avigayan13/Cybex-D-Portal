import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-3xl liquid-glass-interactive relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-zinc-400 mt-1.5 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
            <Icon className="w-7 h-7 text-black" />
          </div>
        )}
      </div>
    </div>
  );
}
