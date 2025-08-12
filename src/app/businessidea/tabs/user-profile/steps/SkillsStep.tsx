"use client";

import React from "react";
import PillMultiSelect from "../components/PillMultiSelect";
import { TECHNICAL_SKILLS, TOOLING_SKILLS, SOFT_SKILLS } from "../types";

type Props = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

export default function SkillsStep({ skills, onChange }: Props) {
  return (
    <div className="space-y-4">
      <PillMultiSelect label="Technical" options={TECHNICAL_SKILLS} value={skills} onChange={onChange} maxSelected={10} />
      <PillMultiSelect label="Tools" options={TOOLING_SKILLS} value={skills} onChange={onChange} maxSelected={10} />
      <PillMultiSelect label="Soft Skills" options={SOFT_SKILLS} value={skills} onChange={onChange} maxSelected={10} />
    </div>
  );
}
