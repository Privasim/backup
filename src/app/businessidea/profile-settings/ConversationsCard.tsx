"use client";

import React from "react";
import { ChatBubbleLeftRightIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface ConversationItem {
  id: string;
  title: string;
  unread?: number;
}

interface ConversationsCardProps {
  conversations?: ConversationItem[];
  onNewChat?: () => void;
  onOpenConversation?: (id: string) => void;
}

export default function ConversationsCard({
  conversations = [],
  onNewChat,
  onOpenConversation,
}: ConversationsCardProps) {
  const hasItems = conversations.length > 0;

  return (
    <section
      className="rounded-2xl bg-white/90 p-2 shadow-sm ring-1 ring-gray-200 backdrop-blur mt-3"
      aria-labelledby="conversations-heading"
    >
      <div className="flex items-center gap-1 px-1">
        <button
          type="button"
          onClick={onNewChat}
          className="ml-auto w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Create a Business Plan"
        >
          <div className="flex w-full items-center justify-between">
            <span>Create a Backup Plan</span>
            <PlusIcon className="h-4 w-4 font-bold" />
          </div>
        </button>
      </div>

      <div className="mt-2">
        {hasItems ? (
          <ul className="divide-y divide-gray-100">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onOpenConversation?.(c.id)}
                  className="flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label={`Open conversation ${c.title}`}
                >
                  <span className="line-clamp-1 flex-1 text-sm text-gray-800">{c.title}</span>
                  {typeof c.unread === "number" && c.unread > 0 && (
                    <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-6 text-center">
      <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300" />
      <p className="mt-2 text-xs text-gray-500">No conversations yet</p>
      <p className="text-xs text-gray-400">Start a new chat to see it here</p>
    </div>
  );
}
