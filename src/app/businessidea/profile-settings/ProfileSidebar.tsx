"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cog6ToothIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ConversationsCard from "./ConversationsCard";
import { useChatbox } from "@/components/chatbox/ChatboxProvider";
import IconDrawer from "@/components/ide-drawer/IconDrawer";

export default function ProfileSidebar() {
  const { conversations, createConversation, openConversation } = useChatbox();
  const router = useRouter();

  // Map conversations to the format expected by ConversationsCard
  const conversationItems = conversations?.map((conv) => ({
    id: conv.id,
    title: conv.title,
    unread: conv.unread || 0,
  })) || [];

  const unreadTotal = conversationItems.reduce((sum, c) => sum + (c.unread || 0), 0);

  const handleNewChat = () => {
    const id = createConversation("New Business Plan");
    openConversation(id);
    router.push("/businessidea");
  };

  const handleOpenConversation = (id: string) => {
    openConversation(id);
    router.push("/businessidea");
  };

  const views = [
    {
      id: "profile",
      label: "Profile Settings",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      render: () => (
        <div className="mt-2">
          {/* Pass no-op toggle and static collapsed=false to reuse existing card UI */}
          <ProfileSettingsCard onToggle={() => {}} isCollapsed={false} />
        </div>
      ),
    },
    {
      id: "conversations",
      label: "Conversations",
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      badge: unreadTotal,
      render: () => (
        <ConversationsCard
          conversations={conversationItems}
          onNewChat={handleNewChat}
          onOpenConversation={handleOpenConversation}
        />
      ),
    },
  ];

  return (
    <IconDrawer
      views={views}
      storageKey="profile-sidebar"
      widthPx={264}
      activityBarWidthPx={52}
      className="bg-surface"
    />
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
