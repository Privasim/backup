import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock Chart.js (only if it exists)
try {
  jest.mock('chart.js', () => ({
    Chart: {
      register: jest.fn(),
    },
    CategoryScale: {},
    LinearScale: {},
    BarElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
  }))
} catch (e) {
  // Chart.js not available, skip mock
}

// Mock react-chartjs-2 (only if it exists)
try {
  jest.mock('react-chartjs-2', () => ({
    Bar: ({ data, options }) => (
      <div data-testid="bar-chart">
        <div data-testid="chart-title">{options?.plugins?.title?.text}</div>
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
      </div>
    ),
    Line: ({ data, options }) => (
      <div data-testid="line-chart">
        <div data-testid="chart-title">{options?.plugins?.title?.text}</div>
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
      </div>
    ),
  }))
} catch (e) {
  // react-chartjs-2 not available, skip mock
}

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <div data-testid="search-icon">🔍</div>,
  XMarkIcon: () => <div data-testid="close-icon">✕</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up">▲</div>,
}))

// Mock Headless UI
jest.mock('@headlessui/react', () => ({
  Tab: {
    Group: ({ children }) => <div data-testid="tab-group">{children}</div>,
    List: ({ children }) => <div data-testid="tab-list">{children}</div>,
    Panels: ({ children }) => <div data-testid="tab-panels">{children}</div>,
    Panel: ({ children }) => <div data-testid="tab-panel">{children}</div>,
  },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  
  // Reset localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Reset fetch mock
  global.fetch.mockClear()
})

// Global test utilities
global.testUtils = {
  // Helper to create mock knowledge base
  createMockKnowledgeBase: () => ({
    metadata: {
      title: 'Test Paper',
      arxivId: '2507.07935',
      url: 'https://example.com/paper.pdf',
      authors: ['Test Author'],
      extractionDate: '2025-01-08T00:00:00.000Z',
      version: '1.0',
    },
    methodology: {
      dataSources: ['O*NET', 'BLS'],
      analysisApproach: 'Task-level analysis',
      confidence: 0.95,
      limitations: ['Test limitation'],
    },
    occupations: [
      {
        code: '15-1252',
        name: 'Software Developers',
        riskScore: 0.96,
        keyTasks: ['Programming', 'Design', 'Testing'],
        tableReferences: ['table_1'],
        confidence: 0.95,
      },
    ],
    tables: [
      {
        id: 'table_1',
        title: 'Test Table',
        page: 1,
        headers: ['Occupation', 'SOC Code', 'Exposure Score'],
        rows: [['Software Developers', '15-1252', '0.96']],
        footnotes: ['Test footnote'],
        source: 'Page 1',
      },
    ],
    visualizations: [
      {
        type: 'bar',
        title: 'Test Chart',
        dataSource: 'occupations',
        config: { xAxis: 'name', yAxis: 'riskScore' },
      },
    ],
    extractionInfo: {
      extractionDate: '2025-01-08T00:00:00.000Z',
      version: '1.0',
      toolsUsed: ['test'],
      qualityScore: 95,
      manualReviewRequired: false,
    },
  }),
  
  // Helper to create mock occupation match
  createMockOccupationMatch: (overrides = {}) => ({
    occupation: {
      code: '15-1252',
      name: 'Software Developers',
      riskScore: 0.96,
      keyTasks: ['Programming', 'Design'],
      tableReferences: ['table_1'],
      confidence: 0.95,
    },
    matchScore: 95,
    matchReasons: ['Exact name match'],
    ...overrides,
  }),
  
  // Helper to wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
}