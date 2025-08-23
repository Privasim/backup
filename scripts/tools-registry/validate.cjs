#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { toolSchema } = require('../src/data/tools-registry/_meta/schemas/tool.schema');

// Load configuration and taxonomy
const config = require('../src/data/tools-registry/_meta/config.json');
const capabilitiesData = require('../src/data/tools-registry/_meta/taxonomy/capabilities.json');
const pricingModelsData = require('../src/data/tools-registry/_meta/taxonomy/pricing-models.json');
const complianceData = require('../src/data/tools-registry/_meta/taxonomy/compliance.json');

// Extract valid values from taxonomy
const validCapabilities = new Set(capabilitiesData.capabilities.map(cap => cap.slug));
const validPricingModels = new Set(pricingModelsData.models);
const validComplianceFlags = new Set(complianceData.flags.map(flag => flag.key));

// Track validation errors
let hasErrors = false;

// Function to report errors
function reportError(category, toolName, message) {
  console.error(`ERROR in ${category}/${toolName}: ${message}`);
  hasErrors = true;
}

// Function to validate a tool
function validateTool(tool, category) {
  // Validate with Zod schema
  const result = toolSchema.safeParse(tool);
  if (!result.success) {
    reportError(category, tool.name, result.error.message);
    return;
  }

  // Additional governance checks
  
  // Check category match
  if (tool.category !== category) {
    reportError(category, tool.name, `Category mismatch: expected '${category}', got '${tool.category}'`);
  }

  // Check capabilities
  for (const capability of tool.capabilities) {
    if (!validCapabilities.has(capability)) {
      reportError(category, tool.name, `Unknown capability: ${capability}`);
    }
  }

  // Check pricing model
  if (!validPricingModels.has(tool.pricing.model)) {
    reportError(category, tool.name, `Unknown pricing model: ${tool.pricing.model}`);
  }

  // Check compliance flags
  if (tool.compliance) {
    for (const flag in tool.compliance) {
      if (!validComplianceFlags.has(flag)) {
        reportError(category, tool.name, `Unknown compliance flag: ${flag}`);
      }
    }
  }

  // Check price range logic
  if (tool.pricing.minMonthlyUSD !== undefined && tool.pricing.maxMonthlyUSD !== undefined) {
    if (tool.pricing.minMonthlyUSD > tool.pricing.maxMonthlyUSD) {
      reportError(category, tool.name, `Invalid price range: min (${tool.pricing.minMonthlyUSD}) > max (${tool.pricing.maxMonthlyUSD})`);
    }
  }
}

// Function to validate a category
function validateCategory(category) {
  const categoryPath = path.join(__dirname, `../src/data/tools-registry/${category}/tools.json`);
  
  if (!fs.existsSync(categoryPath)) {
    reportError(category, '', `Category file not found: ${categoryPath}`);
    return;
  }

  const content = fs.readFileSync(categoryPath, 'utf8');
  let tools;
  
  try {
    tools = JSON.parse(content);
  } catch (err) {
    reportError(category, '', `Invalid JSON in ${categoryPath}: ${err.message}`);
    return;
  }

  // Check if tools is an array
  if (!Array.isArray(tools)) {
    reportError(category, '', `tools.json must contain an array of tools`);
    return;
  }

  // Validate each tool
  const toolIds = new Set();
  for (const tool of tools) {
    // Check for duplicate IDs
    if (toolIds.has(tool.id)) {
      reportError(category, tool.name, `Duplicate tool ID: ${tool.id}`);
      continue;
    }
    toolIds.add(tool.id);

    validateTool(tool, category);
  }

  // Check minimum tools for live categories
  const categoryConfig = config.categories[category];
  if (categoryConfig && categoryConfig.status === 'live') {
    const minTools = categoryConfig.minTools || config.minToolsPerLiveCategory || 3;
    if (tools.length < minTools) {
      reportError(category, '', `Live category must have at least ${minTools} tools, found ${tools.length}`);
    }
  }

  // Check if tools are sorted by name
  for (let i = 1; i < tools.length; i++) {
    if (tools[i-1].name.localeCompare(tools[i].name) > 0) {
      reportError(category, '', `Tools must be sorted by name (ASC). Issue between "${tools[i-1].name}" and "${tools[i].name}"`);
      break;
    }
  }
}

// Main validation function
function main() {
  console.log('Validating tools registry...');

  // Validate each category
  for (const category in config.categories) {
    validateCategory(category);
  }

  // Exit with appropriate code
  if (hasErrors) {
    console.error('\nValidation failed!');
    process.exit(1);
  } else {
    console.log('Validation passed!');
    process.exit(0);
  }
}

// Run validation
main();
