import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface VisualizationOption {
  id: string;
  label: string;
  description?: string;
  selected: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: Record<string, boolean>) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  visualizationOptions?: VisualizationOption[];
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  visualizationOptions = []
}: ConfirmDialogProps) {
  const [selections, setSelections] = React.useState<Record<string, boolean>>({});

  // Initialize selections when dialog opens or options change
  React.useEffect(() => {
    if (isOpen && visualizationOptions.length > 0) {
      const initialSelections = visualizationOptions.reduce((acc, option) => {
        acc[option.id] = option.selected;
        return acc;
      }, {} as Record<string, boolean>);
      setSelections(initialSelections);
    }
  }, [isOpen, visualizationOptions]);

  const handleToggleOption = (id: string) => {
    setSelections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleConfirm = () => {
    onConfirm(selections);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}

                {visualizationOptions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Select visualizations to generate:</p>
                    {visualizationOptions.map((option) => (
                      <div key={option.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`option-${option.id}`}
                            name={`option-${option.id}`}
                            type="checkbox"
                            checked={selections[option.id] || false}
                            onChange={() => handleToggleOption(option.id)}
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`option-${option.id}`} className="font-medium text-gray-700">
                            {option.label}
                          </label>
                          {option.description && (
                            <p className="text-gray-500">{option.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={handleConfirm}
                  >
                    {confirmLabel}
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
