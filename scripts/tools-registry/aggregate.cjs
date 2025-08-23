#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load configuration
const config = require('../../src/data/tools-registry/_meta/config.json');

// Function to read all tools from categories
function readAllTools() {
  const tools = [];
  const categoriesDir = path.join(__dirname, '../../src/data/tools-registry');
  
  // Read each category directory
  for (const categorySlug in config.categories) {
    const categoryPath = path.join(categoriesDir, categorySlug, 'tools.json');
    
    if (fs.existsSync(categoryPath)) {
      const content = fs.readFileSync(categoryPath, 'utf8');
      const categoryTools = JSON.parse(content);
      
      // Add tools to the main array
      tools.push(...categoryTools);
    }
  }
  
  return tools;
}

// Function to build indexes
function buildIndexes(tools) {
  const byCategory = {};
  const byCapability = {};
  
  for (const tool of tools) {
    // Index by category
    if (!byCategory[tool.category]) {
      byCategory[tool.category] = [];
    }
    byCategory[tool.category].push(tool.id);
    
    // Index by capability
    for (const capability of tool.capabilities) {
      if (!byCapability[capability]) {
        byCapability[capability] = [];
      }
      byCapability[capability].push(tool.id);
    }
  }
  
  return { byCategory, byCapability };
}

// Function to calculate integrity hash
function calculateIntegrity(snapshot) {
  // Remove generatedAt for consistent hashing
  const dataToHash = { ...snapshot };
  delete dataToHash.generatedAt;
  
  const dataString = JSON.stringify(dataToHash);
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');
  
  return {
    hash,
    counts: {
      tools: snapshot.tools.length,
      categories: Object.keys(snapshot.categories).length,
      capabilities: Object.keys(snapshot.indexes.byCapability).length
    }
  };
}

// Function to generate snapshot
function generateSnapshot() {
  // Read all tools
  const tools = readAllTools();
  
  // Sort tools by name
  tools.sort((a, b) => a.name.localeCompare(b.name));
  
  // Build indexes
  const indexes = buildIndexes(tools);
  
  // Create snapshot object
  const snapshot = {
    version: config.version,
    schemaVersion: config.schemaVersion,
    generatedAt: new Date().toISOString(),
    categories: config.categories,
    tools,
    indexes
  };
  
  // Calculate integrity
  snapshot.integrity = calculateIntegrity(snapshot);
  
  return snapshot;
}

// Function to write snapshot files
function writeSnapshot(snapshot) {
  const outputPath = path.join(__dirname, '../../public/data');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Write snapshot
  const snapshotPath = path.join(outputPath, 'tools.snapshot.v1.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  
  // Write hash
  const hashPath = path.join(outputPath, 'tools.snapshot.v1.hash');
  fs.writeFileSync(hashPath, snapshot.integrity.hash);
  
  console.log(`Snapshot written to ${snapshotPath}`);
  console.log(`Hash written to ${hashPath}`);
  console.log(`Tools: ${snapshot.tools.length}`);
  console.log(`Categories: ${Object.keys(snapshot.categories).length}`);
  console.log(`Capabilities: ${Object.keys(snapshot.indexes.byCapability).length}`);
}

// Main function
function main() {
  console.log('Generating tools registry snapshot...');
  
  try {
    const snapshot = generateSnapshot();
    writeSnapshot(snapshot);
    console.log('Snapshot generation completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating snapshot:', err.message);
    process.exit(2);
  }
}

// Run aggregation
main();
