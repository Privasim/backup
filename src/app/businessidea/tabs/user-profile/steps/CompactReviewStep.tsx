"use client";

import React from "react";
import { Role } from "../types";
import { useUserProfile } from "../UserProfileContext";
import { ProfileAnalysisTrigger } from '@/components/chatbox/ProfileAnalysisTrigger';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
import { useTab } from "../../TabContext";
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { adaptUserProfileToFormData } from '@/components/chatbox/utils/profile-transformation';

type Props = {
  className?: string;
  onEditStep?: (step: number) => void;
};

function SummaryRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value || '—'}</span>
    </div>
  );
}

function SectionCard({ 
  title, 
  icon, 
  children, 
  onEdit,
  bgColor = "bg-white",
  borderColor = "border-gray-200"
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  onEdit?: () => void;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`p-2.5 rounded-md border ${borderColor} ${bgColor} shadow-sm`}>
      <div className="flex items-center mb-1.5">
        <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-1.5">
          {icon}
        </div>
        <h4 className="text-xs font-medium text-gray-800 mr-auto">{title}</h4>
        {onEdit && (
          <button
            type="button"
            className="text-[10px] text-indigo-600 hover:text-indigo-700"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CompactReviewStep({ className = "", onEditStep }: Props) {
  const { profileData, resetProfileData } = useUserProfile();
  const { role, roleDetails: rd } = profileData;
  const { getAnalysisReadiness } = useProfileIntegration();
  const readiness = getAnalysisReadiness(profileData);
  const { setActiveTab } = useTab();
  const { setProfileData: setChatboxProfileData } = useChatbox();

  const handleAnalyzeJobRisk = () => {
    // Persist profile data to Chatbox context
    const adapted = adaptUserProfileToFormData(profileData);
    setChatboxProfileData(adapted);
    // Navigate to job risk tab
    setActiveTab('jobrisk');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium text-indigo-600">Review Your Profile</h3>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500">Verify your information</p>
          <span className="text-[10px] font-medium text-indigo-600">
            {readiness.completionLevel}% complete
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SectionCard 
          title="Profile" 
          icon={
            <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          onEdit={onEditStep ? () => onEditStep(1) : undefined}
        >
          <SummaryRow label="Role" value={role} />
        </SectionCard>

        {rd?.role === Role.Student && (
          <SectionCard 
            title="Student Details" 
            icon={
              <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            }
            onEdit={onEditStep ? () => onEditStep(2) : undefined}
          >
            <SummaryRow label="Education" value={rd.student?.educationLevel} />
            <SummaryRow label="Field" value={rd.student?.fieldOfStudy} />
            <SummaryRow label="Graduation" value={rd.student?.graduationYear} />
          </SectionCard>
        )}

        {rd?.role === Role.Professional && (
          <SectionCard 
            title="Professional Details" 
            icon={
              <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            onEdit={onEditStep ? () => onEditStep(2) : undefined}
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
              <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            onEdit={onEditStep ? () => onEditStep(2) : undefined}
          >
            <SummaryRow label="Size" value={rd.business?.companySize} />
            <SummaryRow label="Sector" value={rd.business?.sector} />
            <SummaryRow label="Stage" value={rd.business?.stage} />
          </SectionCard>
        )}

        {rd?.role === Role.CareerShifter && (
          <SectionCard 
            title="Career Transition" 
            icon={
              <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            onEdit={onEditStep ? () => onEditStep(2) : undefined}
          >
            <SummaryRow label="From" value={rd.shifter?.previousField} />
            <SummaryRow label="To" value={rd.shifter?.desiredField} />
            <SummaryRow label="Timeline" value={rd.shifter?.timeline} />
          </SectionCard>
        )}


        {(profileData.interests && profileData.interests.length > 0) && (
          <SectionCard 
            title="Interests" 
            icon={
              <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            onEdit={onEditStep ? () => onEditStep(2) : undefined}
          >
            <div className="flex flex-wrap gap-1 pt-0.5">
              {profileData.interests.slice(0, 4).map((i) => (
                <span key={i} className="px-1.5 py-0.5 rounded-full text-[9px] bg-green-50 text-green-700 border border-green-100">{i}</span>
              ))}
              {profileData.interests.length > 4 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-gray-50 text-gray-700 border border-gray-100">
                  +{profileData.interests.length - 4} more
                </span>
              )}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Readiness Status */}
      {!readiness.ready && (
        <div className="p-2 rounded-md border border-yellow-200 bg-yellow-50 text-[10px]">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="h-3.5 w-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">Complete Your Profile</h4>
              <p className="mt-0.5 text-yellow-700">
                Please fill in the following:
              </p>
              <ul className="mt-1 text-yellow-700 list-disc list-inside space-y-0.5">
                {readiness.missing.slice(0, 3).map((field) => (
                  <li key={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                ))}
                {readiness.missing.length > 3 && (
                  <li>And {readiness.missing.length - 3} more fields</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis Trigger */}
      <div className="pt-1">
        <ProfileAnalysisTrigger 
          profileData={profileData} 
          variant="compact" 
          size="sm"
          onAnalysisStart={() => console.log('Analysis started')}
          onAnalysisComplete={() => console.log('Analysis completed')}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={handleAnalyzeJobRisk}
            disabled={!readiness.ready}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title={readiness.ready ? "View job risk analysis" : "Complete your profile to enable job risk analysis"}
            aria-disabled={!readiness.ready}
          >
            Analyze Job Risk
          </button>
          
          <button
            type="button"
            onClick={resetProfileData}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
          >
            Reset
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 text-white opacity-50 cursor-not-allowed transition-all"
            title="UI placeholder — backend not implemented yet"
            aria-disabled
          >
            Save Profile
          </button>
          <p className="text-[9px] text-gray-500">Client-side only</p>
        </div>
      </div>
    </div>
  );
}
