import { transpileTsxToJs } from '../transpile';

// Mock @babel/standalone
jest.mock('@babel/standalone', () => ({
  transform: jest.fn()
}));

import * as Babel from '@babel/standalone';

const mockTransform = Babel.transform as jest.MockedFunction<typeof Babel.transform>;

describe('transpileTsxToJs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject code with banned tokens', async () => {
    const tsxWithBannedToken = `
      export default function Artifact() {
        fetch('/api/data');
        return <div>Hello</div>;
      }
    `;

    const result = await transpileTsxToJs(tsxWithBannedToken);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Banned tokens detected: fetch');
  });

  it('should reject code without default export function', async () => {
    const tsxWithoutExport = `
      const Component = () => <div>Hello</div>;
    `;

    const result = await transpileTsxToJs(tsxWithoutExport);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Code must contain exactly one default export function');
  });

  it('should successfully transpile valid TSX', async () => {
    const validTsx = `
      export default function Artifact() {
        return <div className="p-4">Hello World</div>;
      }
    `;

    mockTransform.mockReturnValue({
      code: 'export default function Artifact() { return React.createElement("div", { className: "p-4" }, "Hello World"); }'
    });

    const result = await transpileTsxToJs(validTsx);

    expect(result.ok).toBe(true);
    expect(result.js).toBeDefined();
    expect(mockTransform).toHaveBeenCalledWith(validTsx, {
      presets: [
        ['typescript', { isTSX: true, allExtensions: true }],
        ['react', { runtime: 'classic' }]
      ],
      filename: 'artifact.tsx'
    });
  });

  it('should handle Babel transformation errors', async () => {
    const invalidTsx = `
      export default function Artifact() {
        return <div>Unclosed div;
      }
    `;

    mockTransform.mockImplementation(() => {
      throw new Error('Unexpected token');
    });

    const result = await transpileTsxToJs(invalidTsx);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Unexpected token');
  });

  it('should detect multiple banned tokens', async () => {
    const tsxWithMultipleBannedTokens = `
      export default function Artifact() {
        window.localStorage.setItem('key', 'value');
        return <div>Hello</div>;
      }
    `;

    const result = await transpileTsxToJs(tsxWithMultipleBannedTokens);

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toContain('window');
    expect(result.errors?.[0]).toContain('localStorage');
  });
});
