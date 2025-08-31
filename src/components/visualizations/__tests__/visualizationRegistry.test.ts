import {
  getVisualizationComponent,
  getDefaultVisualization,
  getAllVisualizations,
  getVisualizationTypes,
  registerVisualization,
  isVisualizationSupported,
  loadVisualizationComponent,
  visualizationRegistry,
} from '../visualizationRegistry';

describe('visualizationRegistry', () => {
  beforeEach(() => {
    // Reset registry to default state
    Object.keys(visualizationRegistry).forEach(key => {
      if (!['standard', 'vertical-timeline'].includes(key)) {
        delete visualizationRegistry[key];
      }
    });
  });

  describe('getVisualizationComponent', () => {
    it('returns component for valid type', () => {
      const component = getVisualizationComponent('standard');
      expect(component).toBeTruthy();
      expect(component?.displayName).toBe('Standard View');
    });

    it('returns null for invalid type', () => {
      const component = getVisualizationComponent('invalid-type');
      expect(component).toBeNull();
    });
  });

  describe('getDefaultVisualization', () => {
    it('returns the default visualization', () => {
      const defaultViz = getDefaultVisualization();
      expect(defaultViz).toBeTruthy();
      expect(defaultViz.isDefault).toBe(true);
      expect(defaultViz.displayName).toBe('Standard View');
    });

    it('falls back to standard if no default is marked', () => {
      // Temporarily remove default flag
      const originalStandard = visualizationRegistry.standard;
      visualizationRegistry.standard = {
        ...originalStandard,
        isDefault: false,
      };

      const defaultViz = getDefaultVisualization();
      expect(defaultViz).toBeTruthy();
      expect(defaultViz.displayName).toBe('Standard View');

      // Restore
      visualizationRegistry.standard = originalStandard;
    });
  });

  describe('getAllVisualizations', () => {
    it('returns all registered visualizations', () => {
      const all = getAllVisualizations();
      expect(all).toHaveLength(2);
      expect(all.map(v => v.displayName)).toContain('Standard View');
      expect(all.map(v => v.displayName)).toContain('Vertical Timeline');
    });
  });

  describe('getVisualizationTypes', () => {
    it('returns all registered type keys', () => {
      const types = getVisualizationTypes();
      expect(types).toContain('standard');
      expect(types).toContain('vertical-timeline');
      expect(types).toHaveLength(2);
    });
  });

  describe('registerVisualization', () => {
    it('registers a new visualization component', () => {
      const mockComponent = {
        component: () => null,
        displayName: 'Test View',
        description: 'Test description',
        supportsFeatures: ['test'],
        isDefault: false,
      };

      registerVisualization('test-type', mockComponent);

      const registered = getVisualizationComponent('test-type');
      expect(registered).toEqual(mockComponent);
      expect(getVisualizationTypes()).toContain('test-type');
    });

    it('overwrites existing visualization', () => {
      const newStandardComponent = {
        component: () => null,
        displayName: 'New Standard View',
        description: 'New description',
        supportsFeatures: ['new-feature'],
        isDefault: true,
      };

      registerVisualization('standard', newStandardComponent);

      const registered = getVisualizationComponent('standard');
      expect(registered?.displayName).toBe('New Standard View');
    });
  });

  describe('isVisualizationSupported', () => {
    it('returns true for supported types', () => {
      expect(isVisualizationSupported('standard')).toBe(true);
      expect(isVisualizationSupported('vertical-timeline')).toBe(true);
    });

    it('returns false for unsupported types', () => {
      expect(isVisualizationSupported('unsupported-type')).toBe(false);
    });
  });

  describe('loadVisualizationComponent', () => {
    it('loads existing component asynchronously', async () => {
      const component = await loadVisualizationComponent('standard');
      expect(component).toBeTruthy();
      expect(component?.displayName).toBe('Standard View');
    });

    it('returns null for non-existent component', async () => {
      const component = await loadVisualizationComponent('non-existent');
      expect(component).toBeNull();
    });
  });

  describe('visualization component structure', () => {
    it('has required properties for standard component', () => {
      const standard = getVisualizationComponent('standard');
      expect(standard).toHaveProperty('component');
      expect(standard).toHaveProperty('displayName');
      expect(standard).toHaveProperty('description');
      expect(standard).toHaveProperty('supportsFeatures');
      expect(standard).toHaveProperty('isDefault');
      
      expect(typeof standard?.component).toBe('function');
      expect(typeof standard?.displayName).toBe('string');
      expect(typeof standard?.description).toBe('string');
      expect(Array.isArray(standard?.supportsFeatures)).toBe(true);
      expect(typeof standard?.isDefault).toBe('boolean');
    });

    it('has required properties for timeline component', () => {
      const timeline = getVisualizationComponent('vertical-timeline');
      expect(timeline).toHaveProperty('component');
      expect(timeline).toHaveProperty('displayName');
      expect(timeline).toHaveProperty('description');
      expect(timeline).toHaveProperty('supportsFeatures');
      expect(timeline).toHaveProperty('isDefault');
      
      expect(timeline?.displayName).toBe('Vertical Timeline');
      expect(timeline?.isDefault).toBe(false);
      expect(timeline?.supportsFeatures).toContain('timeline');
    });
  });

  describe('feature support', () => {
    it('standard component supports expected features', () => {
      const standard = getVisualizationComponent('standard');
      expect(standard?.supportsFeatures).toContain('markdown');
      expect(standard?.supportsFeatures).toContain('copy');
      expect(standard?.supportsFeatures).toContain('download');
    });

    it('timeline component supports expected features', () => {
      const timeline = getVisualizationComponent('vertical-timeline');
      expect(timeline?.supportsFeatures).toContain('timeline');
      expect(timeline?.supportsFeatures).toContain('phases');
      expect(timeline?.supportsFeatures).toContain('milestones');
      expect(timeline?.supportsFeatures).toContain('interactive');
    });
  });
});