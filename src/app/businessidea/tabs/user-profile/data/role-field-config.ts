// File: src/app/businessidea/tabs/user-profile/data/role-field-config.ts
import { Role } from "../types";

export type FieldType = "select" | "multi" | "segmented" | "range";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  group: "core" | "specialty" | "skills" | "credentials" | "experience" | "skillset" | "personality" | "compensation";
  options?: string[] | ((ctx: { role: Role; industry?: string; location?: string }) => string[]);
  visibleIf?: (ctx: { role: Role; values: Record<string, unknown> }) => boolean;
  dependsOn?: string[];
}

export interface FieldGroup {
  id: FieldDef["group"];
  label: string;
  description?: string;
}

export interface RoleFieldConfig {
  groups: FieldGroup[];
  fieldsByRole: Record<Role, FieldDef[]>;
}

const INCOME_RANGES_USD = [
  "<$25k",
  "$25k–$50k",
  "$50k–$75k",
  "$75k–$100k",
  "$100k–$150k",
  "$150k+",
];

const REVENUE_RANGES_USD = [
  "<$50k",
  "$50k–$100k",
  "$100k–$250k",
  "$250k–$1M",
  "$1M+",
];

export const BASE_ROLE_FIELD_CONFIG: RoleFieldConfig = {
  groups: [
    { id: "core", label: "Core" },
    { id: "specialty", label: "Role Specialty" },
    { id: "skills", label: "Skills" },
    { id: "credentials", label: "Credentials" },
    { id: "experience", label: "Experience" },
    { id: "skillset", label: "Skillset" },
    { id: "personality", label: "Personality" },
    { id: "compensation", label: "Compensation" },
  ],
  fieldsByRole: {
    [Role.Student]: [
      {
        id: "targetIncomeRange",
        label: "Target Income",
        type: "range",
        group: "compensation",
        options: () => INCOME_RANGES_USD,
      },
      {
        id: "compensationType",
        label: "Compensation Type",
        type: "segmented",
        group: "compensation",
        options: () => ["Salary", "Hourly", "Stipend"],
      },
      {
        id: "currency",
        label: "Currency",
        type: "select",
        group: "compensation",
        options: () => ["USD"],
        visibleIf: ({ values }) => !!values["compensationType"],
        dependsOn: ["compensationType"],
      },
      // Experience
      {
        id: "internshipExperience",
        label: "Internship Experience",
        type: "select",
        group: "experience",
        options: () => ["None", "<6 months", "6–12 months", "1–2 years", "2+ years"],
      },
      {
        id: "partTimeWork",
        label: "Part-time Work",
        type: "select",
        group: "experience",
        options: () => ["None", "<6 months", "6–12 months", "1–2 years", "2+ years"],
      },
      // Skillset
      {
        id: "studentSkills",
        label: "Core Skills",
        type: "multi",
        group: "skillset",
        options: () => [
          "Communication",
          "Teamwork",
          "Problem Solving",
          "Critical Thinking",
          "Research",
          "Programming",
          "Data Analysis",
          "Design",
        ],
      },
      // Personality
      {
        id: "workStyle",
        label: "Work Style",
        type: "segmented",
        group: "personality",
        options: () => ["Analytical", "Creative", "Collaborative", "Independent"],
      },
      {
        id: "learningStyle",
        label: "Learning Style",
        type: "segmented",
        group: "personality",
        options: () => ["Hands-on", "Visual", "Reading", "Lecture"],
      },
    ],
    [Role.Professional]: [
      {
        id: "incomeRange",
        label: "Current Income",
        type: "range",
        group: "compensation",
        options: () => INCOME_RANGES_USD,
      },
      {
        id: "targetIncomeRange",
        label: "Target Income",
        type: "range",
        group: "compensation",
        options: () => INCOME_RANGES_USD,
      },
      {
        id: "compensationType",
        label: "Compensation Type",
        type: "segmented",
        group: "compensation",
        options: () => ["Salary", "Hourly", "Contract"],
      },
      {
        id: "equityParticipation",
        label: "Equity",
        type: "segmented",
        group: "compensation",
        options: () => ["None", "RSU", "Options"],
        visibleIf: ({ values }) => values["compensationType"] === "Salary" || values["compensationType"] === "Contract",
        dependsOn: ["compensationType"],
      },
      {
        id: "currency",
        label: "Currency",
        type: "select",
        group: "compensation",
        options: () => ["USD"],
        visibleIf: ({ values }) => !!values["compensationType"],
        dependsOn: ["compensationType"],
      },
      // Experience
      {
        id: "managementExperience",
        label: "Management Experience",
        type: "select",
        group: "experience",
        options: () => ["None", "<2 years", "2–5 years", "5+ years"],
      },
      {
        id: "peopleManaged",
        label: "People Managed",
        type: "select",
        group: "experience",
        options: () => ["0", "1–5", "6–10", "10+"],
      },
      // Skillset
      {
        id: "professionalSkills",
        label: "Core Skills",
        type: "multi",
        group: "skillset",
        options: () => [
          "Project Management",
          "Data Analysis",
          "Communication",
          "Leadership",
          "Problem Solving",
          "Programming",
          "UX/UI",
          "Sales",
          "Marketing",
        ],
      },
      // Personality
      {
        id: "decisionStyle",
        label: "Decision Style",
        type: "segmented",
        group: "personality",
        options: () => ["Data-driven", "Intuition", "Consensus"],
      },
      {
        id: "workOrganization",
        label: "Work Organization",
        type: "segmented",
        group: "personality",
        options: () => ["Structured", "Flexible"],
      },
    ],
    [Role.BusinessOwner]: [
      {
        id: "revenueRange",
        label: "Revenue Range",
        type: "range",
        group: "compensation",
        options: () => REVENUE_RANGES_USD,
      },
      {
        id: "ownerDrawStyle",
        label: "Owner Draw",
        type: "segmented",
        group: "compensation",
        options: () => ["Salary", "Distribution"],
      },
      {
        id: "profitabilityStatus",
        label: "Profitability",
        type: "segmented",
        group: "compensation",
        options: () => ["Pre-profit", "Break-even", "Profitable"],
      },
      // Experience
      {
        id: "priorFounderExperience",
        label: "Prior Founder Experience",
        type: "segmented",
        group: "experience",
        options: () => ["None", "1 venture", "2+ ventures"],
      },
      {
        id: "yearsOperating",
        label: "Years Operating",
        type: "select",
        group: "experience",
        options: () => ["<1 year", "1–3 years", "3–5 years", "5+ years"],
      },
      // Skillset
      {
        id: "businessSkills",
        label: "Business Skills",
        type: "multi",
        group: "skillset",
        options: () => [
          "Sales",
          "Marketing",
          "Finance",
          "Operations",
          "Product",
          "HR",
          "Fundraising",
          "Strategy",
        ],
      },
      // Personality
      {
        id: "riskTolerance",
        label: "Risk Tolerance",
        type: "segmented",
        group: "personality",
        options: () => ["Low", "Medium", "High"],
      },
      {
        id: "leadershipStyle",
        label: "Leadership Style",
        type: "select",
        group: "personality",
        options: () => ["Visionary", "Operator", "Coach", "Strategist"],
      },
    ],
    [Role.CareerShifter]: [
      {
        id: "targetIncomeRange",
        label: "Target Income",
        type: "range",
        group: "compensation",
        options: () => INCOME_RANGES_USD,
      },
      {
        id: "compensationType",
        label: "Compensation Type",
        type: "segmented",
        group: "compensation",
        options: () => ["Salary", "Hourly", "Contract"],
      },
      {
        id: "currency",
        label: "Currency",
        type: "select",
        group: "compensation",
        options: () => ["USD"],
        visibleIf: ({ values }) => !!values["compensationType"],
        dependsOn: ["compensationType"],
      },
      // Experience
      {
        id: "transferableExperience",
        label: "Transferable Experience",
        type: "select",
        group: "experience",
        options: () => ["0–1 years", "1–3 years", "3–5 years", "5+ years"],
      },
      {
        id: "educationCommitment",
        label: "Education Commitment",
        type: "segmented",
        group: "experience",
        options: () => ["Bootcamp", "Certification", "Self-study", "Degree"],
      },
      // Skillset
      {
        id: "targetSkills",
        label: "Target Skills",
        type: "multi",
        group: "skillset",
        options: () => [
          "Project Management",
          "Data Analysis",
          "Communication",
          "Leadership",
          "Programming",
          "Design",
          "Marketing",
          "Finance",
        ],
      },
      // Personality
      {
        id: "collaborationPreference",
        label: "Collaboration Preference",
        type: "segmented",
        group: "personality",
        options: () => ["Independent", "Team", "Hybrid"],
      },
      {
        id: "adaptability",
        label: "Adaptability",
        type: "segmented",
        group: "personality",
        options: () => ["Low", "Medium", "High"],
      },
    ],
  },
};
