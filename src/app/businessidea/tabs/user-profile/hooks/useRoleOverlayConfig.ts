// File: src/app/businessidea/tabs/user-profile/hooks/useRoleOverlayConfig.ts
"use client";
import { useEffect, useState } from "react";
import type { RoleFieldConfig } from "../data/role-field-config";

export function useRoleOverlayConfig() {
  const [overlay, setOverlay] = useState<Partial<RoleFieldConfig> | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const url = "/data/role-field-config.overlay.json"; // dev-only file
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as Partial<RoleFieldConfig>;
        if (active) setOverlay(json);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, []);

  return { overlay, error } as const;
}
