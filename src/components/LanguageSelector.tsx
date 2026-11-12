import React from 'react';
import { FrameworkLanguage } from '../types';

interface LanguageSelectorProps {
  selected: FrameworkLanguage;
  onChange: (lang: FrameworkLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selected,
  onChange,
}) => {
  const options: { id: FrameworkLanguage; label: string; ext: string }[] = [
    { id: 'javascript', label: 'JavaScript', ext: '.js' },
    { id: 'react', label: 'React', ext: '.jsx / .tsx' },
    { id: 'css', label: 'CSS', ext: '.css' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">
        Language / Framework:
      </span>
      <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white dark:bg-[#111827] text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`text-[10px] ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {opt.ext}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
