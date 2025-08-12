"use client";

import React from "react";
import { Role, RoleDetails, UserProfileData } from "../types";

type Props = {
  data: UserProfileData;
};

function SummaryRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

export default function ReviewStep({ data }: Props) {
  const role = data.role;
  const rd = data.roleDetails;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Profile</div>
        <SummaryRow label="Role" value={role} />
      </div>

      {rd?.role === Role.Student && (
        <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Student</div>
          <SummaryRow label="Education Level" value={rd.student?.educationLevel} />
          <SummaryRow label="Field of Study" value={rd.student?.fieldOfStudy} />
          <SummaryRow label="Graduation Year" value={rd.student?.graduationYear} />
          <SummaryRow label="Status" value={rd.student?.status} />
        </div>
      )}

      {rd?.role === Role.Professional && (
        <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Professional</div>
          <SummaryRow label="Experience" value={rd.professional?.yearsExperience} />
          <SummaryRow label="Function" value={rd.professional?.jobFunction} />
          <SummaryRow label="Seniority" value={rd.professional?.seniority} />
        </div>
      )}

      {rd?.role === Role.BusinessOwner && (
        <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Business Owner</div>
          <SummaryRow label="Company Size" value={rd.business?.companySize} />
          <SummaryRow label="Sector" value={rd.business?.sector} />
          <SummaryRow label="Stage" value={rd.business?.stage} />
          <SummaryRow label="Team Size" value={rd.business?.teamSize} />
        </div>
      )}

      {rd?.role === Role.CareerShifter && (
        <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Unemployed/Career Shifter</div>
          <SummaryRow label="Previous Field" value={rd.shifter?.previousField} />
          <SummaryRow label="Desired Field" value={rd.shifter?.desiredField} />
          <SummaryRow label="Timeline" value={rd.shifter?.timeline} />
          <SummaryRow label="Work Preference" value={rd.shifter?.workPreference} />
        </div>
      )}

      <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Preferences</div>
        <SummaryRow label="Industry" value={data.industry} />
        <SummaryRow label="Location" value={data.location} />
        <SummaryRow label="Work Preference" value={data.workPreference} />
      </div>

      <div className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Skills</div>
        <div className="flex flex-wrap gap-2">
          {(data.skills || []).length === 0 && <span className="text-sm text-gray-500">No skills selected</span>}
          {(data.skills || []).map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-white text-gray-800 border border-gray-200 shadow-sm">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          className="px-3 py-2 rounded-md text-sm bg-gray-300 text-gray-600 cursor-not-allowed"
          title="UI placeholder — backend not implemented yet"
          aria-disabled
        >
          Save Profile
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-2 rounded-md text-sm bg-gray-300 text-gray-600 cursor-not-allowed"
          title="UI placeholder — backend not implemented yet"
          aria-disabled
        >
          Continue
        </button>
      </div>
      <p className="text-xs text-gray-500">This is a UI-only placeholder. Backend integration will be added later.</p>
    </div>
  );
}
