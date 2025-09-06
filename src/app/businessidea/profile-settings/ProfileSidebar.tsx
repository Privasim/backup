"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cog6ToothIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
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
        <div className="mt-">
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
    {
      id: "tasks",
      label: "Task Management",
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      onClick: () => router.push("/businessidea/task-management"),
      render: () => (
        <section className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="mt-0 px-0">
            <Link
              href="/businessidea/task-management"
              className="inline-flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Open Task Management"
            >
              Open Task Management
            </Link>
          </div>
        </section>
      ),
    },
  ];

  return (
    <div className="h-full">
      <IconDrawer
        views={views}
        storageKey="profile-sidebar"
        widthPx={211}
        activityBarWidthPx={42}
        className="bg-surface h-screen"
      />
    </div>
  );
}

function ProfileSettingsCard({ onToggle, isCollapsed }: { onToggle: () => void; isCollapsed: boolean }) {
  return (
    <section
      className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur"
      aria-labelledby="profile-settings-heading"
    >
      {/* Header */}

      {/* CTA */}
      <div className="mt-0 px-0">
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
