'use client';

import React from 'react';
import { useProfile } from '../../context/ProfileContext';
import { ProfileStorage } from '../../lib/storage';

const PostSubmissionPanel: React.FC = () => {
  const { profileFormData, resetProfile } = useProfile();

  const handleExportProfile = () => {
    const exportData = ProfileStorage.exportProfile();
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your profile data.')) {
      resetProfile();
    }
  };

  // Future action placeholders
  const futureActions = [
    {
      id: 'backup-plan',
      title: 'Create a Backup Plan',
      description: 'Analyze your profile for alternative career paths',
      icon: '🛡️',
      comingSoon: true
    },
    {
      id: 'startup-idea',
      title: 'Suggest a Startup Idea',
      description: 'Generate business ideas based on your skills and experience',
      icon: '💡',
      comingSoon: true
    },
    {
      id: 'industry-fit',
      title: 'Explore Industry Fit',
      description: 'Assess your compatibility with different industries',
      icon: '🎯',
      comingSoon: true
    },
    {
      id: 'learning-path',
      title: 'Generate Learning Path',
      description: 'Create a customized skill development roadmap',
      icon: '📚',
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Profile Complete!</h3>
        <p className="text-sm text-gray-600">
          Your profile has been saved successfully. You can now explore personalized recommendations.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Profile Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Type:</span> {profileFormData.profile.profileType.replace('_', ' ')}</p>
          <p><span className="font-medium">Experience Entries:</span> {profileFormData.experience.length}</p>
          <p><span className="font-medium">Skills:</span> {
            profileFormData.skillset.technical.length + 
            profileFormData.skillset.soft.length
          }</p>
          <p><span className="font-medium">Completed:</span> {
            profileFormData.metadata.completedAt 
              ? new Date(profileFormData.metadata.completedAt).toLocaleDateString()
              : 'Just now'
          }</p>
        </div>
      </div>

      {/* Future Actions */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">What's Next?</h4>
        <div className="grid grid-cols-1 gap-3">
          {futureActions.map(action => (
            <button
              key={action.id}
              disabled={action.comingSoon}
              className={`
                p-4 rounded-lg border text-left transition-colors relative
                ${action.comingSoon 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{action.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
                {action.comingSoon && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Management Actions */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-gray-900">Profile Management</h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleExportProfile}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Profile Data</span>
          </button>
          
          <button
            onClick={handleStartOver}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Start Over</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Privacy Protected</p>
            <p className="text-blue-700 mt-1">
              Your profile data is stored locally on your device and never sent to external servers. 
              You have full control over your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSubmissionPanel;