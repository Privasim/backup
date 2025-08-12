"use client";

import React from "react";
import { Role, RoleDetails, UserProfileData } from "../types";
import { ProfileAnalysisTrigger } from '@/components/chatbox/ProfileAnalysisTrigger';
import { transformUserProfileToAnalysisData } from '@/components/chatbox/utils/profile-transformation';

type Props = {
  data: UserProfileData;
};

function SummaryRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center mb-3">
        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
          {icon}
        </div>
        <h4 className="text-sm font-medium text-gray-800">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function ReviewStep({ data }: Props) {
  const role = data.role;
  const rd = data.roleDetails;

  return (
    <div className="p-1">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-1">Review Your Profile</h3>
        <p className="text-xs text-gray-500">Please review your information before submitting</p>
      </div>
      
      <div className="space-y-4">
        <SectionCard 
          title="Profile" 
          icon={
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <SummaryRow label="Role" value={role} />
        </SectionCard>

        {rd?.role === Role.Student && (
          <SectionCard 
            title="Student Details" 
            icon={
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            }
          >
            <SummaryRow label="Education Level" value={rd.student?.educationLevel} />
            <SummaryRow label="Field of Study" value={rd.student?.fieldOfStudy} />
            <SummaryRow label="Graduation Year" value={rd.student?.graduationYear} />
            <SummaryRow label="Status" value={rd.student?.status} />
          </SectionCard>
        )}

        {rd?.role === Role.Professional && (
          <SectionCard 
            title="Professional Details" 
            icon={
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          >
            <SummaryRow label="Experience" value={rd.professional?.yearsExperience} />
            <SummaryRow label="Function" value={rd.professional?.jobFunction} />
            <SummaryRow label="Seniority" value={rd.professional?.seniority} />
          </SectionCard>
        )}

        {rd?.role === Role.BusinessOwner && (
          <SectionCard 
            title="Business Details" 
            icon={
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          >
            <SummaryRow label="Company Size" value={rd.business?.companySize} />
            <SummaryRow label="Sector" value={rd.business?.sector} />
            <SummaryRow label="Stage" value={rd.business?.stage} />
            <SummaryRow label="Team Size" value={rd.business?.teamSize} />
          </SectionCard>
        )}

        {rd?.role === Role.CareerShifter && (
          <SectionCard 
            title="Career Transition Details" 
            icon={
              <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
          >
            <SummaryRow label="Previous Field" value={rd.shifter?.previousField} />
            <SummaryRow label="Desired Field" value={rd.shifter?.desiredField} />
            <SummaryRow label="Timeline" value={rd.shifter?.timeline} />
            <SummaryRow label="Work Preference" value={rd.shifter?.workPreference} />
          </SectionCard>
        )}

        <SectionCard 
          title="Preferences" 
          icon={
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <SummaryRow label="Industry" value={data.industry} />
          <SummaryRow label="Location" value={data.location} />
          <SummaryRow label="Work Preference" value={data.workPreference} />
        </SectionCard>

        <SectionCard 
          title="Skills" 
          icon={
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {(data.skills || []).length === 0 && <span className="text-sm text-gray-500">No skills selected</span>}
            {(data.skills || []).map((s) => (
              <span key={s} className="px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
            ))}
          </div>
        </SectionCard>

        {/* Profile Analysis Trigger */}
        <div className="mt-6">
          <ProfileAnalysisTrigger 
            profileData={data} 
            variant="card" 
            size="md"
            onAnalysisStart={() => console.log('Analysis started')}
            onAnalysisComplete={() => console.log('Analysis completed')}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-500 text-white opacity-50 cursor-not-allowed transition-all"
            title="UI placeholder — backend not implemented yet"
            aria-disabled
          >
            Save Profile
          </button>
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white opacity-50 cursor-not-allowed transition-all"
            title="UI placeholder — backend not implemented yet"
            aria-disabled
          >
            Continue
          </button>
          <p className="text-xs text-gray-500 mt-2 sm:mt-0 sm:ml-auto">This is a UI-only placeholder. Backend integration will be added later.</p>
        </div>
      </div>
    </div>
  );
}
