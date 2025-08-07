'use client';

import { useState } from 'react';
import SettingsTrigger from './settings-panel/SettingsTrigger';
import SettingsPanel from './settings-panel/SettingsPanel';

export default function ListTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <SettingsTrigger onClick={() => setIsSettingsOpen(true)} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">List View</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            This is the list view content. You can add your list items, tables, or any other content here.
          </p>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Example Items</h3>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-medium">{item}</span>
                  </div>
                  <span className="text-gray-700">List Item {item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
