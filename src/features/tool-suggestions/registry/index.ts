import { RegistrySnapshot } from '../../../data/tools-registry/_meta/schemas/registry.schema';

// Define the path to the snapshot file
const SNAPSHOT_PATH = '/data/tools.snapshot.v1.json';

// In-memory cache for the registry snapshot
let cachedSnapshot: RegistrySnapshot | null = null;

/**
 * Load the tools registry snapshot
 * @returns Promise<RegistrySnapshot>
 */
export async function loadRegistrySnapshot(): Promise<RegistrySnapshot> {
  // Return cached snapshot if available
  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  try {
    // In a browser environment, fetch the snapshot
    const response = await fetch(SNAPSHOT_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load registry snapshot: ${response.statusText}`);
    }
    
    const snapshot = await response.json();
    cachedSnapshot = snapshot;
    return snapshot;
  } catch (error) {
    console.error('Error loading registry snapshot:', error);
    throw new Error('Failed to load tools registry');
  }
}

/**
 * Get tools by category
 * @param categorySlug - The category slug
 * @returns Promise<Tool[]>
 */
export async function getToolsByCategory(categorySlug: string) {
  const snapshot = await loadRegistrySnapshot();
  return snapshot.tools.filter(tool => tool.category === categorySlug);
}

/**
 * Get tools by capability
 * @param capabilitySlug - The capability slug
 * @returns Promise<Tool[]>
 */
export async function getToolsByCapability(capabilitySlug: string) {
  const snapshot = await loadRegistrySnapshot();
  const toolIds = snapshot.indexes.byCapability[capabilitySlug] || [];
  return snapshot.tools.filter(tool => toolIds.includes(tool.id));
}

/**
 * Search tools by name or description
 * @param query - The search query
 * @returns Promise<Tool[]>
 */
export async function searchTools(query: string) {
  const snapshot = await loadRegistrySnapshot();
  const lowerQuery = query.toLowerCase();
  
  return snapshot.tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) || 
    tool.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all categories
 * @returns Promise<CategoryInfo[]>
 */
export async function getCategories() {
  const snapshot = await loadRegistrySnapshot();
  return Object.entries(snapshot.categories).map(([slug, info]) => ({
    slug,
    ...info
  }));
}

/**
 * Get tool by ID
 * @param id - The tool ID
 * @returns Promise<Tool | undefined>
 */
export async function getToolById(id: string) {
  const snapshot = await loadRegistrySnapshot();
  return snapshot.tools.find(tool => tool.id === id);
}

// Types
export type CategoryInfo = {
  slug: string;
  name: string;
  status: 'live' | 'draft';
  minTools: number;
};

export type { Tool } from '../../../data/tools-registry/_meta/schemas/tool.schema';
export type { RegistrySnapshot };
