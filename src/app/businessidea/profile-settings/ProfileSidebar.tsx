"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import ConversationsCard from "./ConversationsCard";
import { useChatbox } from "@/components/chatbox/ChatboxProvider";

export default function ProfileSidebar() {
  const { conversations, createConversation, openConversation } = useChatbox();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Map conversations to the format expected by ConversationsCard
  const conversationItems = conversations?.map(conv => ({
    id: conv.id,
    title: conv.title,
    unread: conv.unread || 0
  })) || [];
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleNewChat = () => {
    const id = createConversation('New Business Plan');
    openConversation(id);
    router.push('/businessidea');
  };

  const handleOpenConversation = (id: string) => {
    openConversation(id);
    router.push('/businessidea');
  };
  
  return (
    <>
      <aside 
        className={`relative bg-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}`} 
        aria-label="Profile sidebar"
      >
        <div className="sticky top-0 mt-4 h-[calc(100vh-2rem)]">
          <div className="flex h-full flex-col gap-4">
            <ProfileSettingsCard onToggle={toggleSidebar} isCollapsed={isCollapsed} />
            <ConversationsCard 
              conversations={conversationItems}
              onNewChat={handleNewChat}
              onOpenConversation={handleOpenConversation}
            />
          </div>
        </div>
      </aside>
      
      {/* Toggle button that stays visible when collapsed */}
      <button
        onClick={toggleSidebar}
        className={`fixed left-0 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-r-lg bg-white shadow-md transition-all duration-300 hover:bg-gray-100 ${isCollapsed ? 'ml-0' : 'ml-64'}`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L5.293 10l6.293-6.293a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </>
  );
}

function ProfileSettingsCard({ onToggle, isCollapsed }: { onToggle: () => void; isCollapsed: boolean }) {
  return (
    <section
      className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-gray-200 backdrop-blur"
      aria-labelledby="profile-settings-heading"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-gray-200">
          <Image src="/next.svg" alt="App" fill className="object-contain p-2" />
        </div>
        <h2 id="profile-settings-heading" className="text-sm font-semibold text-gray-900">
          Profile Settings
        </h2>
        <button 
          onClick={onToggle}
          className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>



      {/* CTA */}
      <div className="mt-3 px-1">
        <Link
          href="/businessidea/profile-settings"
          className="inline-flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Open Profile Settings Tabs"
        >
          Open Profile Settings
        </Link>
      </div>
    </section>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  active,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          active
            ? "bg-orange-50 text-orange-900 ring-1 ring-orange-200"
            : danger
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-50",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    </li>
  );
}
