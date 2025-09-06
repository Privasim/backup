"use client";

import React, { useState } from 'react';
import ProfileSidebar from '../profile-settings/ProfileSidebar';
import { ChatboxToggle } from '@/components/chatbox/ChatboxToggle';
import { PlusIcon } from '@heroicons/react/24/outline';

// Task type definition
type TaskPriority = 'low' | 'medium' | 'high';
type TaskStatus = 'planned' | 'on-queue' | 'to-do' | 'ongoing' | 'for-review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}

// Sample task data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Research market trends',
    description: 'Analyze current market trends for our industry',
    priority: 'high',
    status: 'planned',
    dueDate: '2025-09-15',
    assignee: 'Alex',
    tags: ['research', 'market']
  },
  {
    id: '2',
    title: 'Update competitor analysis',
    description: 'Review and update our competitor analysis document',
    priority: 'medium',
    status: 'planned',
    dueDate: '2025-09-20',
    assignee: 'Jordan',
    tags: ['research', 'competitors']
  },
  {
    id: '3',
    title: 'Prepare Q4 budget',
    description: 'Draft the Q4 budget proposal for review',
    priority: 'high',
    status: 'on-queue',
    dueDate: '2025-09-10',
    assignee: 'Morgan',
    tags: ['finance', 'planning']
  },
  {
    id: '4',
    title: 'Design new landing page',
    description: 'Create wireframes for the new landing page',
    priority: 'medium',
    status: 'to-do',
    dueDate: '2025-09-25',
    assignee: 'Taylor',
    tags: ['design', 'website']
  },
  {
    id: '5',
    title: 'Implement analytics tracking',
    description: 'Add Google Analytics tracking to the website',
    priority: 'medium',
    status: 'ongoing',
    dueDate: '2025-09-12',
    assignee: 'Casey',
    tags: ['development', 'analytics']
  },
  {
    id: '6',
    title: 'Write blog post',
    description: 'Write a blog post about our new features',
    priority: 'low',
    status: 'for-review',
    dueDate: '2025-09-08',
    assignee: 'Riley',
    tags: ['marketing', 'content']
  },
  {
    id: '7',
    title: 'Update user documentation',
    description: 'Update the user documentation with new features',
    priority: 'low',
    status: 'done',
    dueDate: '2025-09-05',
    assignee: 'Jamie',
    tags: ['documentation']
  },
  {
    id: '8',
    title: 'Fix login bug',
    description: 'Investigate and fix the login issue reported by users',
    priority: 'high',
    status: 'ongoing',
    dueDate: '2025-09-07',
    assignee: 'Alex',
    tags: ['development', 'bug']
  },
  {
    id: '9',
    title: 'Customer feedback review',
    description: 'Analyze recent customer feedback and identify trends',
    priority: 'medium',
    status: 'for-review',
    dueDate: '2025-09-14',
    assignee: 'Morgan',
    tags: ['customer', 'feedback']
  },
  {
    id: '10',
    title: 'Prepare investor presentation',
    description: 'Create slides for the upcoming investor meeting',
    priority: 'high',
    status: 'to-do',
    dueDate: '2025-09-18',
    assignee: 'Jordan',
    tags: ['finance', 'presentation']
  },
  {
    id: '11',
    title: 'Social media campaign',
    description: 'Plan and schedule social media posts for product launch',
    priority: 'medium',
    status: 'on-queue',
    dueDate: '2025-09-22',
    assignee: 'Riley',
    tags: ['marketing', 'social']
  },
  {
    id: '12',
    title: 'Team retrospective',
    description: 'Conduct sprint retrospective meeting',
    priority: 'medium',
    status: 'done',
    dueDate: '2025-09-04',
    assignee: 'Jamie',
    tags: ['team', 'process']
  }
];

// Column configuration
const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'planned', title: 'Planned', color: 'bg-purple-100 border-purple-200' },
  { id: 'on-queue', title: 'On Queue', color: 'bg-blue-100 border-blue-200' },
  { id: 'to-do', title: 'To Do', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'ongoing', title: 'Ongoing', color: 'bg-orange-100 border-orange-200' },
  { id: 'for-review', title: 'For Review', color: 'bg-pink-100 border-pink-200' },
  { id: 'done', title: 'Done', color: 'bg-green-100 border-green-200' }
];

// Task Card Component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        {task.dueDate && (
          <span className="flex items-center">
            <span className="mr-1">📅</span>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assignee && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
            {task.assignee}
          </span>
        )}
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map(tag => (
            <span 
              key={tag} 
              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Column Component
const TaskColumn: React.FC<{ 
  title: string; 
  tasks: Task[]; 
  color: string;
}> = ({ title, tasks, color }) => {
  return (
    <div className="flex-1 min-w-[250px] max-w-[350px]">
      <div className={`rounded-t-lg ${color} px-3 py-2 flex justify-between items-center`}>
        <h2 className="font-medium text-gray-800">{title}</h2>
        <span className="bg-white text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="bg-gray-50 rounded-b-lg p-2 h-[calc(100%-40px)] overflow-y-auto">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        <button className="w-full mt-2 flex items-center justify-center py-1 px-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Task
        </button>
      </div>
    </div>
  );
};

export default function TaskManagementPage() {
  const [tasks] = useState<Task[]>(initialTasks);

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative">
        {/* Chatbox Toggle in bottom right corner (global dock remains via RootLayout) */}
        <div className="absolute bottom-4 right-4 z-10">
          <ChatboxToggle variant="icon" size="md" />
        </div>

        <div className="flex gap-4">
          {/* Left: Sidebar (preserves UX consistency) */}
          <ProfileSidebar />

          {/* Right: Main content */}
          <div className="flex-1 overflow-hidden">
            <div className="py-1">
              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Task Management</h1>
                    <p className="text-sm text-gray-600">Manage your team's tasks and track progress</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Filter
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700">
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      New Task
                    </button>
                  </div>
                </div>
                
                {/* Kanban Board */}
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 200px)' }}>
                  {columns.map(column => (
                    <TaskColumn 
                      key={column.id}
                      title={column.title}
                      tasks={tasksByStatus[column.id] || []}
                      color={column.color}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
