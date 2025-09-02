import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SpecsSettingsPanel } from './SpecsSettingsPanel';
import { useSpecsGenerator } from '../useSpecsGenerator';

interface SpecsSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecsSettingsDialog({ isOpen, onClose }: SpecsSettingsDialogProps) {
  const { settings, actions, state } = useSpecsGenerator();
  const [localSettings, setLocalSettings] = useState(settings);
  const closeRef = useRef<HTMLButtonElement>(null);
  
  // Reset local settings when dialog opens or provider settings change
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);
  
  const handleApply = () => {
    actions.updateSettings(localSettings);
    onClose();
  };
  
  // Determine if inputs should be disabled
  const isDisabled = state.status === 'generating' || state.status === 'streaming';
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {/* Prevent closing on outside click */}} initialFocus={closeRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Specification Settings
                  </Dialog.Title>
                  <button
                    ref={closeRef}
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <SpecsSettingsPanel
                    settings={localSettings}
                    onChange={(newSettings) => setLocalSettings(prev => ({ ...prev, ...newSettings }))}
                    disabled={isDisabled}
                    showHeader={false}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={onClose}
                    disabled={isDisabled}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleApply}
                    disabled={isDisabled}
                  >
                    Apply
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
