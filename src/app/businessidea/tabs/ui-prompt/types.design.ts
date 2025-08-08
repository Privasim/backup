// Design Spec types for Stage A

export interface DesignTask {
  id: string;
  title: string;
  rationale: string;
  acceptanceCriteria: string[];
}

export interface DesignTokens {
  colors: {
    background: string;
    surface: string;
    border: string;
    text: string;
    mutedText: string;
    primary: string;
  };
  spacing: 'compact' | 'cozy';
  typography: {
    fontFamily: string;
    baseSize: number;
    scale: 1.125 | 1.2;
  };
}

export interface ComponentSpec {
  name: string;
  props?: { name: string; type: string; required?: boolean }[];
  states?: string[];
  variants?: string[];
}

export interface LayoutSection {
  id: string;
  title?: string;
  components: string[];
}

export interface InteractionSpec {
  component: string;
  event: string;
  behavior: string;
  accessibility?: string;
}

export interface DesignSpec {
  title: string;
  description: string;
  tasks: DesignTask[];
  designTokens: DesignTokens;
  components: ComponentSpec[];
  layout: { sections: LayoutSection[] };
  interactions: InteractionSpec[];
  libraries: {
    primary: 'tailwind';
    optional?: Array<'shadcn' | 'headlessui' | 'radix'>;
  };
  constraints: string[];
}
