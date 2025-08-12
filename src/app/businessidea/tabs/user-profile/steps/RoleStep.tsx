"use client";

import React from "react";
import { Role } from "../types";

type Props = {
  role?: Role;
  onSelect: (role: Role) => void;
};

const CARDS: { role: Role; title: string; desc: string; icon: React.ReactNode }[] = [
  { role: Role.Student, title: 'Student', desc: 'Currently studying or graduating soon', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.5c-1.886-.63-3.955-1-6-1s-4.114.37-6 1a12.083 12.083 0 01-.16-9.922L12 14z"/></svg>
  )},
  { role: Role.Professional, title: 'Professional', desc: 'Working professional in any field', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-7 8h8a2 2 0 002-2v-3a2 2 0 00-2-2H8a2 2 0 00-2 2v3a2 2 0 002 2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 100-8 4 4 0 000 8z"/></svg>
  )},
  { role: Role.BusinessOwner, title: 'Business Owner', desc: 'Founder or small business owner', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M4 10h16l-1 10H5L4 10z"/></svg>
  )},
  { role: Role.CareerShifter, title: 'Unemployed/Career Shifter', desc: 'Exploring new opportunities', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9" strokeWidth="2"/></svg>
  )},
];

export default function RoleStep({ role, onSelect }: Props) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">Tell us about yourself</h3>
      <p className="mt-1 text-sm text-gray-600">Select the option that best describes you.</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Select Role">
        {CARDS.map((c) => {
          const selected = role === c.role;
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => onSelect(c.role)}
              className={`text-left p-3 rounded-lg border transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.99] ${
                selected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={selected}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${selected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{c.icon}</div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{c.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{c.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
