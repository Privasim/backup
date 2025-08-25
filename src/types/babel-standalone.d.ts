declare module '@babel/standalone' {
  interface TransformOptions {
    presets?: (string | [string, any])[];
    filename?: string;
  }

  interface TransformResult {
    code?: string;
    map?: any;
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
}
