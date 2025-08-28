// File: src/app/businessidea/tabs/user-profile/hooks/useRoleLocalValues.ts
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Role } from "../types";
import { FieldDef } from "../data/role-field-config";

const STORAGE_KEY = "user-profile-role-extras";

type RoleValues = Partial<Record<Role, Record<string, unknown>>>;

function safeParse(json: string | null): RoleValues {
  if (!json) return {};
  try {
    const obj = JSON.parse(json);
    if (obj && typeof obj === "object") return obj as RoleValues;
    return {};
  } catch {
    return {};
  }
}

export function useRoleLocalValues(role: Role | undefined) {
  const [store, setStore] = useState<RoleValues>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStore((prev) => ({ ...prev, ...safeParse(sessionStorage.getItem(STORAGE_KEY)) }));
  }, []);

  const values = useMemo(() => {
    if (!role) return {} as Record<string, unknown>;
    return store[role] ?? {};
  }, [store, role]);

  const setValue = useCallback(
    (id: string, value: unknown, fields?: FieldDef[]) => {
      if (!role) return;
      setStore((prev) => {
        const current = { ...(prev[role] ?? {}) } as Record<string, unknown>;
        current[id] = value;

        // prune dependents for fields declaring dependsOn -> includes id
        if (fields && fields.length) {
          for (const f of fields) {
            if (Array.isArray(f.dependsOn) && f.dependsOn.includes(id)) {
              delete current[f.id];
            }
          }
        }

        const next: RoleValues = { ...prev, [role]: current };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [role]
  );

  return { values, setValue } as const;
}
