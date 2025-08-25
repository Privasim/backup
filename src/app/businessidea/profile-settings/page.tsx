import React from 'react';
import ProfileSettingsTabs from './ProfileSettingsTabs';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
      </div>
      <ProfileSettingsTabs />
    </div>
  );
}
