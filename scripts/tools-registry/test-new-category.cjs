#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Testing new no-code-app-builder category...');

// Check if the new category directory exists
const categoryDir = path.join(__dirname, '../../src/data/tools-registry/no-code-app-builder');
if (fs.existsSync(categoryDir)) {
  console.log('✓ no-code-app-builder directory exists');
  
  // Check tools.json
  const toolsPath = path.join(categoryDir, 'tools.json');
  if (fs.existsSync(toolsPath)) {
    console.log('✓ tools.json exists');
    const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
    console.log('  - Tools count:', tools.length);
    console.log('  - Tool names:', tools.map(t => t.name).join(', '));
    
    // Verify category field in tools
    const correctCategory = tools.every(t => t.category === 'no-code-app-builder');
    console.log('  - Category field correct:', correctCategory);
  } else {
    console.log('✗ tools.json missing');
  }
} else {
  console.log('✗ no-code-app-builder directory missing');
}

// Check if category is in config.json
const configPath = path.join(__dirname, '../../src/data/tools-registry/_meta/config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const hasCategory = config.categories.hasOwnProperty('no-code-app-builder');
  console.log('✓ config.json exists');
  console.log('  - Has no-code-app-builder category:', hasCategory);
  if (hasCategory) {
    console.log('  - Category name:', config.categories['no-code-app-builder'].name);
    console.log('  - Category status:', config.categories['no-code-app-builder'].status);
  }
} else {
  console.log('✗ config.json missing');
}

console.log('\nNew category test completed.');
