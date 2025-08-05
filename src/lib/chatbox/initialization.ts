import { storageManager } from '@/components/chatbox/utils/storage-manager';

/**
 * Initialize chatbox services and storage
 */
export const initializeChatboxServices = async () => {
  try {
    // Perform storage migration if needed
    const migrationResult = await storageManager.migrate();
    
    if (migrationResult.success) {
      console.log('Chatbox storage initialized successfully');
      
      if (migrationResult.migratedItems > 0) {
        console.log(`Migrated ${migrationResult.migratedItems} items to new storage format`);
      }
    } else {
      console.warn('Storage migration had issues:', migrationResult.errors);
    }
    
    // Perform initial cleanup if needed
    const stats = storageManager.getStorageStats();
    
    // Auto-cleanup if storage is getting large (>10MB)
    if (stats.totalSize > 10 * 1024 * 1024) {
      console.log('Performing initial storage cleanup...');
      const cleanupResult = storageManager.cleanup();
      
      if (cleanupResult.removedItems > 0) {
        console.log(`Cleaned up ${cleanupResult.removedItems} items, freed ${cleanupResult.freedSpace} bytes`);
      }
    }
    
    return { success: true, migrationResult };
  } catch (error) {
    console.error('Failed to initialize chatbox services:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get storage health information
 */
export const getStorageHealth = () => {
  const stats = storageManager.getStorageStats();
  
  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // Check total size
  if (stats.totalSize > 20 * 1024 * 1024) { // 20MB
    health.status = 'critical';
    health.issues.push('Storage usage is very high (>20MB)');
    health.recommendations.push('Consider clearing analysis history or performing cleanup');
  } else if (stats.totalSize > 10 * 1024 * 1024) { // 10MB
    health.status = 'warning';
    health.issues.push('Storage usage is high (>10MB)');
    health.recommendations.push('Consider performing cleanup to optimize storage');
  }
  
  // Check cache size
  if (stats.cacheSize > 5 * 1024 * 1024) { // 5MB
    health.issues.push('Cache size is large (>5MB)');
    health.recommendations.push('Cache cleanup may improve performance');
  }
  
  // Check item count
  if (stats.itemCount > 100) {
    health.issues.push('Large number of stored items');
    health.recommendations.push('Consider clearing old analysis history');
  }
  
  return {
    ...health,
    stats
  };
};

/**
 * Perform maintenance tasks
 */
export const performMaintenance = async () => {
  const results = {
    cleanup: { removedItems: 0, freedSpace: 0, errors: [] as string[] },
    migration: { success: true, migratedItems: 0, errors: [] as string[] }
  };
  
  try {
    // Perform cleanup
    results.cleanup = storageManager.cleanup();
    
    // Perform migration check
    results.migration = await storageManager.migrate();
    
    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      results
    };
  }
};