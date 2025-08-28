// File: src/app/businessidea/tabs/user-profile/hooks/useRoleFieldConfig.ts
"use client";
import { useMemo } from "react";
import { BASE_ROLE_FIELD_CONFIG, FieldDef, RoleFieldConfig } from "../data/role-field-config";
import { Role } from "../types";
import { useRoleOverlayConfig } from "./useRoleOverlayConfig";

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
  const { overlay } = useRoleOverlayConfig();

  const cfg = useMemo<RoleFieldConfig>(() => {
    if (!overlay) return BASE_ROLE_FIELD_CONFIG;

    // Merge groups by id; overlay can override labels or add new groups
    const baseGroups = BASE_ROLE_FIELD_CONFIG.groups;
    const overlayGroups = overlay.groups ?? [];
    const groupMap = new Map(baseGroups.map((g) => [g.id, g] as const));
    for (const og of overlayGroups) {
      groupMap.set(og.id, { ...groupMap.get(og.id), ...og });
    }

    // Merge fieldsByRole with id override (overlay wins)
    const mergedFieldsByRole = { ...BASE_ROLE_FIELD_CONFIG.fieldsByRole } as RoleFieldConfig["fieldsByRole"];
    for (const r of Object.values(Role)) {
      const base = (BASE_ROLE_FIELD_CONFIG.fieldsByRole as any)[r] ?? [];
      const add = (overlay.fieldsByRole as any)?.[r] ?? [];
      const byId = new Map<string, FieldDef>();
      for (const f of base as FieldDef[]) byId.set(f.id, f);
      for (const f of add as FieldDef[]) byId.set(f.id, { ...byId.get(f.id), ...f });
      (mergedFieldsByRole as any)[r] = Array.from(byId.values());
    }

    return {
      groups: Array.from(groupMap.values()),
      fieldsByRole: mergedFieldsByRole,
    };
  }, [overlay]);

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
