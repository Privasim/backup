// Code Bundle types for Stage B

import type { WireframeScreen } from './types';

export interface CodeFile {
  path: string;      // e.g., "src/app/login/page.tsx"
  language: string;  // e.g., "tsx", "ts", "css"
  content: string;   // code text only
}

export interface CodeBundle {
  files: CodeFile[];
  suggestedDependencies: Array<{ name: string; version?: string; reason: string }>;
  readme?: string;
  previewDsl?: WireframeScreen; // safe preview rendering via DSL
}
