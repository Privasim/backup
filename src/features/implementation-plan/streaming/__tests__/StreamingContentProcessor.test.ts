import { StreamingContentProcessor } from '../StreamingContentProcessor';

describe('StreamingContentProcessor', () => {
  let processor: StreamingContentProcessor;

  beforeEach(() => {
    processor = new StreamingContentProcessor();
  });

  afterEach(() => {
    processor.reset();
  });

  it('should initialize with empty state', () => {
    const progress = processor.getProgress();
    expect(progress.currentPhase).toBe('initializing');
    expect(progress.progress).toBe(0);
    expect(processor.getCurrentSections()).toHaveLength(0);
  });

  it('should process simple text chunks', () => {
    const result = processor.processChunk('Starting implementation plan...');
    
    expect(result.hasNewContent).toBe(true);
    expect(result.progress.currentPhase).toBe('initializing');
  });

  it('should detect overview phase from content', () => {
    const chunk = '{"overview": {"goals": ["Test goal 1", "Test goal 2"]}}';
    const result = processor.processChunk(chunk);
    
    expect(result.progress.currentPhase).toBe('overview');
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it('should extract readable content from JSON', () => {
    const chunk = '{"overview": {"goals": ["Increase revenue", "Expand market"]}}';
    processor.processChunk(chunk);
    
    const sections = processor.getCurrentSections();
    const overviewSection = sections.find(s => s.type === 'overview');
    
    expect(overviewSection).toBeDefined();
    expect(overviewSection?.content).toContain('Goal: Increase revenue');
    expect(overviewSection?.content).toContain('Goal: Expand market');
  });

  it('should handle partial JSON gracefully', () => {
    processor.processChunk('{"overview": {"goals": ["Test');
    processor.processChunk(' goal"], "successCriteria": ["Success"]}');
    
    const sections = processor.getCurrentSections();
    expect(sections.length).toBeGreaterThanOrEqual(0); // Should not crash
  });

  it('should track progress correctly', () => {
    // Add overview
    processor.processChunk('{"overview": {"goals": ["Goal 1"]}}');
    let progress = processor.getProgress();
    expect(progress.progress).toBeGreaterThan(0);
    
    // Add phases
    processor.processChunk('{"phases": [{"name": "Phase 1", "objectives": ["Obj 1"]}]}');
    progress = processor.getProgress();
    expect(progress.progress).toBeGreaterThan(15); // Should increase
  });

  it('should reset state properly', () => {
    processor.processChunk('{"overview": {"goals": ["Test"]}}');
    expect(processor.getCurrentSections().length).toBeGreaterThan(0);
    
    processor.reset();
    expect(processor.getCurrentSections()).toHaveLength(0);
    expect(processor.getProgress().progress).toBe(0);
  });
});