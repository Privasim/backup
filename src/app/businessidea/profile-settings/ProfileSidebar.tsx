"use client";

import React from "react";
import Image from "next/image";
import {
  UserIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import ConversationsCard from "./ConversationsCard";

export default function ProfileSidebar() {
  return (
    <aside className="relative w-80 shrink-0" aria-label="Profile sidebar">
      <div className="sticky top-0 mt-4 h-[calc(100vh-2rem)]">
        <div className="flex h-full flex-col gap-4">
          <ProfileSettingsCard />
          <ConversationsCard />
        </div>
      </div>
    </aside>
  );
}

function ProfileSettingsCard() {
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
      </div>

      {/* Items */}
      <ul className="mt-3 space-y-1">
        <SettingsItem icon={UserIcon} label="Personal Information" active />
        <SettingsItem icon={LockClosedIcon} label="Login & Password" />
        <SettingsItem icon={Cog6ToothIcon} label="Preferences" />
        <div className="mx-1 h-px bg-gray-100" />
        <SettingsItem icon={ArrowLeftOnRectangleIcon} label="Log Out" danger />
      </ul>
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
