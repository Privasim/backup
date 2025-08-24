import React from 'react';

type SettingsTriggerProps = {
  onClick: () => void;
};

export default function SettingsTrigger({ onClick }: SettingsTriggerProps) {
  return (
    <button 
      className="group absolute -top-3 -right-3 p-2.5 text-slate-500 hover:text-slate-700 transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-slate-200/60 hover:border-slate-300/80 hover:scale-105 active:scale-95"
      onClick={onClick}
      aria-label="Open Settings"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      }}
    >
      <svg 
        className="h-5 w-5 transition-transform duration-200 group-hover:rotate-45" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    </button>
  );
}
