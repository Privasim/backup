import React from 'react';
import ProfileSettingsTabs from './ProfileSettingsTabs';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600">Manage your profile, job risk, and business plan</p>
        </div>
        <Link
          href="/businessidea"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Back to Business Ideas"
        >
          Back
        </Link>
      </div>
      <ProfileSettingsTabs />
    </div>
  );
}
