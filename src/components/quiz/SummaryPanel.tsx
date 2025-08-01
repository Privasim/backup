'use client';

import { useEffect, useMemo, useState } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { formatJobTitle } from '@/lib/quiz/data';
import { getResearchService, initializeResearchService } from '@/lib/research/service';
import knowledgeBase from '@/lib/research/data/ai_employment_risks.json';

interface SummaryPanelProps {
  data: QuizData;
  onEdit: (step: number) => void;
}

type ExposureBadge =
  | { status: 'resolved'; level: 'Low' | 'Medium' | 'High' | 'Very High'; scorePct: number; matchedName: string }
  | { status: 'unresolved' };

export default function SummaryPanel({ data, onEdit }: SummaryPanelProps) {
  const [badge, setBadge] = useState<ExposureBadge>({ status: 'unresolved' });

  const summaryItems = useMemo(() => ([
    {
      label: 'Job Role',
      value: formatJobTitle(data.jobDescription),
      step: 1,
      icon: '💼'
    },
    {
      label: 'Experience',
      value: data.experience,
      step: 2,
      icon: '📈'
    },
    {
      label: 'Industry',
      value: data.industry,
      step: 2,
      icon: '🏢'
    },
    {
      label: 'Location',
      value: data.location,
      step: 2,
      icon: '📍'
    },
    {
      label: 'Salary Range',
      value: data.salaryRange,
      step: 2,
      icon: '💰'
    }
  ]), [data]);

  useEffect(() => {
    let cancelled = false;

    const resolveExposure = async () => {
      try {
        await initializeResearchService(knowledgeBase as any);
        const service = getResearchService();

        // Try to find the closest occupation deterministically
        const matches = await service.searchOccupations(data.jobDescription, { limit: 1 });
        const top = matches?.[0];
        if (!top || cancelled) {
          setBadge({ status: 'unresolved' });
          return;
        }

        const risk = top.occupation.riskScore; // 0..1
        const scorePct = Math.round(risk * 100);
        let level: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low';
        if (risk >= 0.8) level = 'Very High';
        else if (risk >= 0.6) level = 'High';
        else if (risk >= 0.4) level = 'Medium';

        if (!cancelled) {
          setBadge({
            status: 'resolved',
            level,
            scorePct,
            matchedName: top.occupation.name
          });
        }
      } catch {
        if (!cancelled) setBadge({ status: 'unresolved' });
      }
    };

    resolveExposure();
    return () => { cancelled = true; };
  }, [data.jobDescription]);

  const levelClasses = (level: 'Low' | 'Medium' | 'High' | 'Very High') => {
    switch (level) {
      case 'Low': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'High': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Very High': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Profile Summary</h3>
        {badge.status === 'resolved' ? (
          <div className={`text-xs font-medium px-2.5 py-1.5 rounded ${levelClasses(badge.level)}`}>
            Exposure: {badge.level} • {badge.scorePct}% {badge.matchedName ? `(${badge.matchedName})` : ''}
          </div>
        ) : (
          <div className="text-xs text-blue-600 font-medium">Review before analysis</div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <div className="text-sm text-gray-900">{item.value}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit(item.step)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              Edit
            </button>
          </div>
        ))}

        {/* Skills Section */}
        <div className="flex items-start justify-between py-2">
          <div className="flex items-start space-x-3">
            <span className="text-lg mt-0.5">🛠️</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Skills</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {data.skillSet.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {data.skillSet.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{data.skillSet.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-blue-200">
        <div className="flex items-center text-xs text-blue-700">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          This information will be used to analyze AI's impact on your career. Learn how we assess risk on the Research Dashboard.
        </div>
      </div>
    </div>
  );
}