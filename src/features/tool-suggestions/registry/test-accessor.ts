// Simple test to verify the registry accessor
// This would typically be part of a larger test suite

import { loadRegistrySnapshot, getToolsByCategory, getCategories } from './index';

async function testAccessor() {
  console.log('Testing registry accessor...');
  
  try {
    // Test loading the snapshot
    console.log('Loading registry snapshot...');
    const snapshot = await loadRegistrySnapshot();
    console.log('✓ Snapshot loaded successfully');
    console.log(`  - Version: ${snapshot.version}`);
    console.log(`  - Schema version: ${snapshot.schemaVersion}`);
    console.log(`  - Tools count: ${snapshot.tools.length}`);
    console.log(`  - Categories count: ${Object.keys(snapshot.categories).length}`);
    
    // Test getting categories
    console.log('\nGetting categories...');
    const categories = await getCategories();
    console.log('✓ Categories retrieved successfully');
    console.log(`  - Categories: ${categories.map(c => c.slug).join(', ')}`);
    
    // Test getting tools by category
    console.log('\nGetting tools by category...');
    const noCodeTools = await getToolsByCategory('no-code-apps');
    console.log('✓ Tools retrieved successfully');
    console.log(`  - No-code apps count: ${noCodeTools.length}`);
    console.log(`  - First tool: ${noCodeTools[0]?.name}`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAccessor();
