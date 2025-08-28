// File: src/app/businessidea/tabs/user-profile/data/role-field-config.ts
import { Role } from "../types";

export type FieldType = "select" | "multi" | "segmented" | "range";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  group: "core" | "specialty" | "skills" | "credentials" | "compensation";
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
    ],
    [Role.BusinessOwner]: [
      {
        id: "revenueRange",
        label: "Revenue Range",
        type: "range",
        group: "compensation",
        options: () => REVENUE_RANGES_USD,
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
    ],
  },
};
