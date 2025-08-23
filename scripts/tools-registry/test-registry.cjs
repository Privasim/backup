#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Testing tools registry structure...');

// Check if _meta directory exists
const metaDir = path.join(__dirname, '../../src/data/tools-registry/_meta');
if (fs.existsSync(metaDir)) {
  console.log('✓ _meta directory exists');
  
  // Check config.json
  const configPath = path.join(metaDir, 'config.json');
  if (fs.existsSync(configPath)) {
    console.log('✓ config.json exists');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('  - Registry version:', config.version);
    console.log('  - Schema version:', config.schemaVersion);
    console.log('  - Categories:', Object.keys(config.categories).join(', '));
  } else {
    console.log('✗ config.json missing');
  }
  
  // Check taxonomy directory
  const taxonomyDir = path.join(metaDir, 'taxonomy');
  if (fs.existsSync(taxonomyDir)) {
    console.log('✓ taxonomy directory exists');
    
    // Check capabilities.json
    const capabilitiesPath = path.join(taxonomyDir, 'capabilities.json');
    if (fs.existsSync(capabilitiesPath)) {
      console.log('✓ capabilities.json exists');
      const capabilities = JSON.parse(fs.readFileSync(capabilitiesPath, 'utf8'));
      console.log('  - Capabilities count:', capabilities.capabilities.length);
    } else {
      console.log('✗ capabilities.json missing');
    }
    
    // Check pricing-models.json
    const pricingModelsPath = path.join(taxonomyDir, 'pricing-models.json');
    if (fs.existsSync(pricingModelsPath)) {
      console.log('✓ pricing-models.json exists');
      const pricingModels = JSON.parse(fs.readFileSync(pricingModelsPath, 'utf8'));
      console.log('  - Pricing models:', pricingModels.models.join(', '));
    } else {
      console.log('✗ pricing-models.json missing');
    }
    
    // Check compliance.json
    const compliancePath = path.join(taxonomyDir, 'compliance.json');
    if (fs.existsSync(compliancePath)) {
      console.log('✓ compliance.json exists');
      const compliance = JSON.parse(fs.readFileSync(compliancePath, 'utf8'));
      console.log('  - Compliance flags:', compliance.flags.map(f => f.key).join(', '));
    } else {
      console.log('✗ compliance.json missing');
    }
  } else {
    console.log('✗ taxonomy directory missing');
  }
  
  // Check schemas directory
  const schemasDir = path.join(metaDir, 'schemas');
  if (fs.existsSync(schemasDir)) {
    console.log('✓ schemas directory exists');
    
    const schemaFiles = fs.readdirSync(schemasDir);
    console.log('  - Schema files:', schemaFiles.join(', '));
  } else {
    console.log('✗ schemas directory missing');
  }
} else {
  console.log('✗ _meta directory missing');
}

// Check category directories
const categoriesDir = path.join(__dirname, '../../src/data/tools-registry');
const categoryDirs = fs.readdirSync(categoriesDir).filter(f => 
  fs.statSync(path.join(categoriesDir, f)).isDirectory() && f !== '_meta'
);

console.log('\nCategory directories:');
categoryDirs.forEach(category => {
  console.log('✓', category);
  
  const toolsPath = path.join(categoriesDir, category, 'tools.json');
  if (fs.existsSync(toolsPath)) {
    const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
    console.log('  - Tools count:', tools.length);
  } else {
    console.log('  - ✗ tools.json missing');
  }
});

console.log('\nRegistry structure test completed.');
