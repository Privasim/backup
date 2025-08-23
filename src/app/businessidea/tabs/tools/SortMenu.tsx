'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { SortMode } from '@/features/tools-registry/types';

interface SortMenuProps {
  value: SortMode;
  onChange: (sort: SortMode) => void;
  className?: string;
}

const sortOptions: { value: SortMode; label: string; description: string }[] = [
  { value: 'name', label: 'Name', description: 'A to Z' },
  { value: 'price-asc', label: 'Price', description: 'Low to High' },
  { value: 'price-desc', label: 'Price', description: 'High to Low' },
  { value: 'recent', label: 'Recently Updated', description: 'Newest first' },
];

export function SortMenu({ value, onChange, className }: SortMenuProps) {
  const currentOption = sortOptions.find(option => option.value === value) || sortOptions[0];

  return (
    <Menu as="div" className={cn("relative inline-block text-left", className)}>
      <div>
        <Menu.Button className="inline-flex w-full justify-center items-center gap-x-2 rounded-xl bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Bars3BottomLeftIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="hidden sm:inline">Sort by</span>
          <span className="font-semibold">{currentOption.label}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={cn(
                      "group flex w-full items-center justify-between px-4 py-3 text-sm transition-colors",
                      active
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-300",
                      value === option.value && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </div>
                    {value === option.value && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
