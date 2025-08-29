"use client";

import React, { useMemo } from "react";
import CompactSelect from "../CompactSelect";
import SegmentedControl from "../SegmentedControl";
import IncomeCurrencyField from "../fields/IncomeCurrencyField";
import ExperienceField from "../fields/ExperienceField";
import EducationField from "../fields/EducationField";
import ChallengesGoalsField from "../fields/ChallengesGoalsField";
import {
  EDUCATION_LEVEL_OPTIONS,
  FIELD_OF_STUDY_BY_EDUCATION_LEVEL,
  GRAD_YEAR_OPTIONS,
  GOAL_OPTIONS_STUDENT,
  StudentDetails
} from "../../types";

interface StudentDetailsFormProps {
  data: StudentDetails;
  onUpdate: (patch: Partial<StudentDetails>) => void;
  industry?: string;
  className?: string;
}

export default function StudentDetailsForm({
  data,
  onUpdate,
  industry,
  className = ""
}: StudentDetailsFormProps) {
  // Get field of study options based on education level
  const fieldOfStudyOptions = useMemo(() => {
    if (!data.educationLevel) return FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
    return FIELD_OF_STUDY_BY_EDUCATION_LEVEL[data.educationLevel] || FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
  }, [data.educationLevel]);

  const handleEducationChange = (education: { level?: string; field?: string; completion?: string }) => {
    const patch: Partial<StudentDetails> = {};
    if (education.level !== undefined) {
      patch.educationLevel = education.level;
      // Clear field of study if it's not valid for new level
      if (data.fieldOfStudy && !FIELD_OF_STUDY_BY_EDUCATION_LEVEL[education.level]?.includes(data.fieldOfStudy)) {
        patch.fieldOfStudy = undefined;
      }
    }
    if (education.field !== undefined) patch.fieldOfStudy = education.field;
    if (education.completion !== undefined) patch.graduationYear = education.completion;
    onUpdate(patch);
  };

  const handleIncomeChange = (income: { range?: string; currency?: string; type?: string }) => {
    // Store income data in a structured way - this could be expanded later
    onUpdate({
      // For now, we'll store these as separate fields, but they could be combined
      ...(income.range && { targetIncome: income.range }),
      ...(income.type && { compensationType: income.type })
    });
  };

  const handleExperienceChange = (experience: { type?: string; duration?: string; details?: string }) => {
    // Store experience data - could be expanded to handle multiple experiences
    onUpdate({
      ...(experience.type && { experienceType: experience.type }),
      ...(experience.duration && { experienceDuration: experience.duration })
    });
  };

  const handleGoalsChange = (goals: { current?: string[]; desired?: string[] }) => {
    onUpdate({
      studentGoals: goals.desired
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-indigo-600">Student Details</h3>
        <p className="text-xs text-gray-500">Educational background and goals</p>
      </div>

      {/* Education - Required */}
      <EducationField
        value={{
          level: data.educationLevel,
          field: data.fieldOfStudy,
          completion: data.graduationYear
        }}
        onChange={handleEducationChange}
        levelOptions={EDUCATION_LEVEL_OPTIONS}
        fieldOptions={fieldOfStudyOptions}
        completionOptions={GRAD_YEAR_OPTIONS}
        required
      />

      {/* Status */}
      <SegmentedControl
        label="Status"
        options={["Full-time", "Part-time"]}
        value={data.status}
        onChange={(value) => onUpdate({ status: value as "Full-time" | "Part-time" })}
      />

      {/* Experience */}
      <ExperienceField
        value={{
          type: (data as any).experienceType,
          duration: (data as any).experienceDuration
        }}
        onChange={handleExperienceChange}
        typeOptions={["Internship", "Part-time Job", "Project Work", "Volunteer", "None"]}
        durationOptions={["None", "<6 months", "6–12 months", "1–2 years", "2+ years"]}
        label="Work Experience"
      />

      {/* Income Expectations */}
      <IncomeCurrencyField
        value={{
          range: (data as any).targetIncome,
          currency: "USD",
          type: (data as any).compensationType
        }}
        onChange={handleIncomeChange}
        rangeOptions={["<$25k", "$25k–$50k", "$50k–$75k", "$75k–$100k", "$100k+"]}
        typeOptions={["Salary", "Hourly", "Stipend"]}
        label="Target Income"
      />

      {/* Goals */}
      <ChallengesGoalsField
        value={{
          desired: data.studentGoals
        }}
        onChange={handleGoalsChange}
        goalOptions={GOAL_OPTIONS_STUDENT}
        label="Academic Goals"
      />
    </div>
  );
}