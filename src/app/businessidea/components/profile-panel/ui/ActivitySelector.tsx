'use client';

import React, { useState } from 'react';

interface ActivitySelectorProps {
  label: string;
  value: string[];
  onChange: (activities: string[]) => void;
  maxActivities?: number;
  placeholder?: string;
  className?: string;
}

const COMMON_ACTIVITIES = [
  'Project management',
  'Data analysis',
  'Client communication',
  'Team leadership',
  'Problem solving',
  'Creative work',
  'Strategic planning',
  'Customer service',
  'Sales & marketing',
  'Technical development',
  'Research & development',
  'Training & mentoring',
  'Quality assurance',
  'Process improvement',
  'Financial planning',
  'Content creation',
  'Social media management',
  'Event planning',
  'Vendor management',
  'Budget management'
];

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  label,
  value = [],
  onChange,
  maxActivities = 3,
  placeholder = "Select your top activities...",
  className = ""
}) => {
  const [customActivity, setCustomActivity] = useState('');

  const handleToggleActivity = (activity: string) => {
    if (value.includes(activity)) {
      onChange(value.filter(a => a !== activity));
    } else if (value.length < maxActivities) {
      onChange([...value, activity]);
    }
  };

  const handleAddCustomActivity = () => {
    if (customActivity.trim() && !value.includes(customActivity.trim()) && value.length < maxActivities) {
      onChange([...value, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomActivity();
    }
  };

  const removeActivity = (activity: string) => {
    onChange(value.filter(a => a !== activity));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-xs text-gray-500 ml-2">({value.length}/{maxActivities})</span>
      </label>

      {/* Selected activities display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((activity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {activity}
              <button
                type="button"
                onClick={() => removeActivity(activity)}
                className="ml-1 flex-shrink-0 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Common activities */}
      <div className="grid grid-cols-2 gap-2">
        {COMMON_ACTIVITIES.filter(activity => !value.includes(activity)).map((activity) => (
          <button
            key={activity}
            type="button"
            onClick={() => handleToggleActivity(activity)}
            disabled={value.length >= maxActivities && !value.includes(activity)}
            className={`px-3 py-2 text-xs rounded-md border transition-colors ${
              value.includes(activity)
                ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                : value.length >= maxActivities
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {activity}
          </button>
        ))}
      </div>

      {/* Custom activity input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add custom activity..."
          disabled={value.length >= maxActivities}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="button"
          onClick={handleAddCustomActivity}
          disabled={!customActivity.trim() || value.length >= maxActivities}
          className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ActivitySelector;
