import { ChatboxPlugin, AnalysisType, ChatboxContext } from '../types';

interface PluginConfig {
  id: string;
  name: string;
  version: string;
  analysisTypes: AnalysisType[];
  initialize?: (context: ChatboxContext) => Promise<void>;
  cleanup?: () => Promise<void>;
  getControls?: () => React.ComponentType<any>;
  processData?: (data: any) => Promise<any>;
}

/**
 * Utility function to create a chatbox plugin with default implementations
 */
export const createChatboxPlugin = (config: PluginConfig): ChatboxPlugin => {
  return {
    id: config.id,
    name: config.name,
    version: config.version,
    analysisTypes: config.analysisTypes,
    
    initialize: config.initialize || (async () => {
      console.log(`Plugin ${config.name} initialized`);
    }),
    
    cleanup: config.cleanup || (async () => {
      console.log(`Plugin ${config.name} cleaned up`);
    }),
    
    getControls: config.getControls,
    processData: config.processData
  };
};

/**
 * Utility to validate plugin configuration
 */
export const validatePlugin = (plugin: ChatboxPlugin): boolean => {
  if (!plugin.id || !plugin.name || !plugin.version) {
    console.error('Plugin missing required fields: id, name, version');
    return false;
  }
  
  if (!Array.isArray(plugin.analysisTypes) || plugin.analysisTypes.length === 0) {
    console.error('Plugin must specify at least one analysis type');
    return false;
  }
  
  if (typeof plugin.initialize !== 'function' || typeof plugin.cleanup !== 'function') {
    console.error('Plugin must implement initialize and cleanup methods');
    return false;
  }
  
  return true;
};

/**
 * Plugin registry for managing multiple plugins
 */
export class PluginRegistry {
  private plugins = new Map<string, ChatboxPlugin>();
  
  register(plugin: ChatboxPlugin): boolean {
    if (!validatePlugin(plugin)) {
      return false;
    }
    
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered, replacing...`);
    }
    
    this.plugins.set(plugin.id, plugin);
    return true;
  }
  
  unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }
  
  get(pluginId: string): ChatboxPlugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  getAll(): ChatboxPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  getByAnalysisType(analysisType: AnalysisType): ChatboxPlugin[] {
    return this.getAll().filter(plugin => 
      plugin.analysisTypes.includes(analysisType)
    );
  }
  
  clear(): void {
    this.plugins.clear();
  }
}