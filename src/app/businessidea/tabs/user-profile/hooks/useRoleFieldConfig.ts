// File: src/app/businessidea/tabs/user-profile/hooks/useRoleFieldConfig.ts
"use client";
import { useMemo } from "react";
import { BASE_ROLE_FIELD_CONFIG, FieldDef, RoleFieldConfig } from "../data/role-field-config";
import { Role } from "../types";

export interface UseRoleFieldConfigArgs {
  role: Role;
  context: { industry?: string; location?: string; values: Record<string, unknown> };
}

export interface ResolvedField extends Omit<FieldDef, "options"> {
  options?: string[];
}

export interface UseRoleFieldConfigResult {
  groups: RoleFieldConfig["groups"];
  fields: ResolvedField[];
}

export function useRoleFieldConfig({ role, context }: UseRoleFieldConfigArgs): UseRoleFieldConfigResult {
  const cfg = BASE_ROLE_FIELD_CONFIG;
  const rawFields = cfg.fieldsByRole[role] ?? [];

  const fields = useMemo<ResolvedField[]>(() => {
    return rawFields
      .filter((f) => (f.visibleIf ? f.visibleIf({ role, values: context.values }) : true))
      .map((f) => ({
        ...f,
        options:
          typeof f.options === "function"
            ? f.options({ role, industry: context.industry, location: context.location })
            : f.options ?? [],
      }));
  }, [rawFields, role, context.industry, context.location, context.values]);

  return { groups: cfg.groups, fields };
}
