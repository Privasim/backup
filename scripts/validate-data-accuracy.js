#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected data from the arXiv paper for validation
const EXPECTED_DATA = {
  metadata: {
    title: 'The Impact of Generative AI on Employment',
    arxivId: '2507.07935',
    authors: ['Edward W. Felten', 'Manav Raj', 'Robert Seamans'],
  },
  
  // Key occupations with their exact risk scores from the paper
  occupations: {
    'Software Developers': { code: '15-1252', riskScore: 0.96 },
    'Data Scientists': { code: '15-2051', riskScore: 0.94 },
    'Web Developers': { code: '15-1254', riskScore: 0.93 },
    'Computer Systems Analysts': { code: '15-1211', riskScore: 0.91 },
    'Technical Writers': { code: '27-3042', riskScore: 0.90 },
    'Financial Analysts': { code: '13-2051', riskScore: 0.89 },
    'Market Research Analysts': { code: '13-1161', riskScore: 0.88 },
    'Graphic Designers': { code: '27-1024', riskScore: 0.87 },
    'Accountants and Auditors': { code: '13-2011', riskScore: 0.86 },
    'Lawyers': { code: '23-1011', riskScore: 0.85 },
  },
  
  // Industry exposure scores
  industries: {
    'Professional, Scientific, and Technical Services': 0.73,
    'Finance and Insurance': 0.68,
    'Information': 0.67,
    'Management of Companies and Enterprises': 0.65,
    'Educational Services': 0.58,
  },
  
  // Task automation potential
  tasks: {
    'Information Processing': 0.89,
    'Content Creation': 0.87,
    'Data Analysis': 0.85,
    'Code Development': 0.83,
    'Research and Investigation': 0.78,
  },
};

async function loadKnowledgeBase() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/research/data/ai_employment_risks.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Failed to load knowledge base: ${error.message}`, 'red');
    return null;
  }
}

function validateMetadata(knowledgeBase) {
  log('\n📋 Validating Metadata...', 'cyan');
  
  const metadata = knowledgeBase.metadata;
  let issues = 0;
  
  // Check title
  if (metadata.title !== EXPECTED_DATA.metadata.title) {
    log(`  ❌ Title mismatch: expected "${EXPECTED_DATA.metadata.title}", got "${metadata.title}"`, 'red');
    issues++;
  } else {
    log(`  ✅ Title correct`, 'green');
  }
  
  // Check arXiv ID
  if (metadata.arxivId !== EXPECTED_DATA.metadata.arxivId) {
    log(`  ❌ arXiv ID mismatch: expected "${EXPECTED_DATA.metadata.arxivId}", got "${metadata.arxivId}"`, 'red');
    issues++;
  } else {
    log(`  ✅ arXiv ID correct`, 'green');
  }
  
  // Check authors
  const expectedAuthors = EXPECTED_DATA.metadata.authors;
  const actualAuthors = metadata.authors;
  
  for (const expectedAuthor of expectedAuthors) {
    if (!actualAuthors.includes(expectedAuthor)) {
      log(`  ❌ Missing author: ${expectedAuthor}`, 'red');
      issues++;
    }
  }
  
  if (issues === 0) {
    log(`  ✅ All authors present: ${actualAuthors.join(', ')}`, 'green');
  }
  
  return issues;
}

function validateOccupations(knowledgeBase) {
  log('\n👥 Validating Occupation Data...', 'cyan');
  
  const occupations = knowledgeBase.occupations;
  let issues = 0;
  let validated = 0;
  
  for (const [expectedName, expectedData] of Object.entries(EXPECTED_DATA.occupations)) {
    const actualOccupation = occupations.find(occ => 
      occ.name === expectedName || occ.name.includes(expectedName.split(' ')[0])
    );
    
    if (!actualOccupation) {
      log(`  ❌ Missing occupation: ${expectedName}`, 'red');
      issues++;
      continue;
    }
    
    // Check SOC code
    if (actualOccupation.code !== expectedData.code) {
      log(`  ❌ ${expectedName}: SOC code mismatch (expected ${expectedData.code}, got ${actualOccupation.code})`, 'red');
      issues++;
    }
    
    // Check risk score (allow small floating point differences)
    const scoreDiff = Math.abs(actualOccupation.riskScore - expectedData.riskScore);
    if (scoreDiff > 0.001) {
      log(`  ❌ ${expectedName}: Risk score mismatch (expected ${expectedData.riskScore}, got ${actualOccupation.riskScore})`, 'red');
      issues++;
    } else {
      log(`  ✅ ${expectedName}: Correct (${actualOccupation.riskScore})`, 'green');
      validated++;
    }
  }
  
  log(`\n  📊 Occupation validation: ${validated}/${Object.keys(EXPECTED_DATA.occupations).length} correct`, 'blue');
  return issues;
}

function validateIndustries(knowledgeBase) {
  log('\n🏭 Validating Industry Data...', 'cyan');
  
  // Find industry table
  const industryTable = knowledgeBase.tables.find(table => 
    table.title.toLowerCase().includes('industry')
  );
  
  if (!industryTable) {
    log(`  ❌ Industry table not found`, 'red');
    return 1;
  }
  
  let issues = 0;
  let validated = 0;
  
  for (const [expectedIndustry, expectedScore] of Object.entries(EXPECTED_DATA.industries)) {
    const industryRow = industryTable.rows.find(row => 
      row[0] && row[0].includes(expectedIndustry.split(',')[0])
    );
    
    if (!industryRow) {
      log(`  ❌ Missing industry: ${expectedIndustry}`, 'red');
      issues++;
      continue;
    }
    
    const actualScore = parseFloat(industryRow[2]);
    const scoreDiff = Math.abs(actualScore - expectedScore);
    
    if (scoreDiff > 0.001) {
      log(`  ❌ ${expectedIndustry}: Score mismatch (expected ${expectedScore}, got ${actualScore})`, 'red');
      issues++;
    } else {
      log(`  ✅ ${expectedIndustry}: Correct (${actualScore})`, 'green');
      validated++;
    }
  }
  
  log(`\n  📊 Industry validation: ${validated}/${Object.keys(EXPECTED_DATA.industries).length} correct`, 'blue');
  return issues;
}

function validateTasks(knowledgeBase) {
  log('\n⚙️  Validating Task Data...', 'cyan');
  
  // Find task table
  const taskTable = knowledgeBase.tables.find(table => 
    table.title.toLowerCase().includes('task')
  );
  
  if (!taskTable) {
    log(`  ❌ Task table not found`, 'red');
    return 1;
  }
  
  let issues = 0;
  let validated = 0;
  
  for (const [expectedTask, expectedScore] of Object.entries(EXPECTED_DATA.tasks)) {
    const taskRow = taskTable.rows.find(row => 
      row[0] && row[0].includes(expectedTask)
    );
    
    if (!taskRow) {
      log(`  ❌ Missing task: ${expectedTask}`, 'red');
      issues++;
      continue;
    }
    
    const actualScore = parseFloat(taskRow[2]);
    const scoreDiff = Math.abs(actualScore - expectedScore);
    
    if (scoreDiff > 0.001) {
      log(`  ❌ ${expectedTask}: Score mismatch (expected ${expectedScore}, got ${actualScore})`, 'red');
      issues++;
    } else {
      log(`  ✅ ${expectedTask}: Correct (${actualScore})`, 'green');
      validated++;
    }
  }
  
  log(`\n  📊 Task validation: ${validated}/${Object.keys(EXPECTED_DATA.tasks).length} correct`, 'blue');
  return issues;
}

function validateDataStructure(knowledgeBase) {
  log('\n🏗️  Validating Data Structure...', 'cyan');
  
  let issues = 0;
  
  // Check required top-level fields
  const requiredFields = ['metadata', 'methodology', 'occupations', 'tables', 'visualizations', 'extractionInfo'];
  for (const field of requiredFields) {
    if (!knowledgeBase[field]) {
      log(`  ❌ Missing required field: ${field}`, 'red');
      issues++;
    } else {
      log(`  ✅ Field present: ${field}`, 'green');
    }
  }
  
  // Check data counts
  const occupationCount = knowledgeBase.occupations?.length || 0;
  const tableCount = knowledgeBase.tables?.length || 0;
  
  if (occupationCount < 15) {
    log(`  ⚠️  Low occupation count: ${occupationCount} (expected at least 15)`, 'yellow');
  } else {
    log(`  ✅ Occupation count: ${occupationCount}`, 'green');
  }
  
  if (tableCount < 4) {
    log(`  ⚠️  Low table count: ${tableCount} (expected at least 4)`, 'yellow');
  } else {
    log(`  ✅ Table count: ${tableCount}`, 'green');
  }
  
  // Check occupation data structure
  if (knowledgeBase.occupations) {
    const sampleOccupation = knowledgeBase.occupations[0];
    const requiredOccFields = ['code', 'name', 'riskScore', 'keyTasks', 'tableReferences', 'confidence'];
    
    for (const field of requiredOccFields) {
      if (sampleOccupation[field] === undefined) {
        log(`  ❌ Missing occupation field: ${field}`, 'red');
        issues++;
      }
    }
  }
  
  return issues;
}

function generateValidationReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      totalIssues: results.reduce((sum, r) => sum + r.issues, 0),
      validationsPassed: results.reduce((sum, r) => sum + r.passed, 0),
      validationsTotal: results.reduce((sum, r) => sum + r.total, 0),
    },
    details: results,
  };
  
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    .then(() => log(`\n📄 Validation report saved to: ${reportPath}`, 'blue'))
    .catch(err => log(`❌ Failed to save report: ${err.message}`, 'red'));
  
  return report;
}

async function main() {
  log('🔍 Data Accuracy Validation', 'bright');
  log('============================', 'bright');
  
  const knowledgeBase = await loadKnowledgeBase();
  if (!knowledgeBase) {
    process.exit(1);
  }
  
  log(`\n📊 Loaded knowledge base with:`, 'blue');
  log(`  • ${knowledgeBase.occupations?.length || 0} occupations`, 'blue');
  log(`  • ${knowledgeBase.tables?.length || 0} tables`, 'blue');
  log(`  • ${knowledgeBase.visualizations?.length || 0} visualizations`, 'blue');
  
  // Run all validations
  const results = [
    { name: 'Metadata', issues: validateMetadata(knowledgeBase) },
    { name: 'Data Structure', issues: validateDataStructure(knowledgeBase) },
    { name: 'Occupations', issues: validateOccupations(knowledgeBase) },
    { name: 'Industries', issues: validateIndustries(knowledgeBase) },
    { name: 'Tasks', issues: validateTasks(knowledgeBase) },
  ];
  
  // Calculate totals
  const totalIssues = results.reduce((sum, r) => sum + r.issues, 0);
  const totalValidations = results.length;
  const passedValidations = results.filter(r => r.issues === 0).length;
  
  // Generate report
  generateValidationReport(results.map(r => ({
    ...r,
    passed: r.issues === 0 ? 1 : 0,
    total: 1,
  })));
  
  // Final summary
  log('\n' + '='.repeat(50), 'bright');
  log('📈 Validation Summary:', 'cyan');
  log(`  • Total validations: ${totalValidations}`, 'blue');
  log(`  • Passed: ${passedValidations}`, passedValidations === totalValidations ? 'green' : 'yellow');
  log(`  • Failed: ${totalValidations - passedValidations}`, totalValidations - passedValidations === 0 ? 'green' : 'red');
  log(`  • Total issues found: ${totalIssues}`, totalIssues === 0 ? 'green' : 'red');
  
  if (totalIssues === 0) {
    log('\n🎉 All validations passed! Data accuracy confirmed.', 'green');
  } else {
    log('\n⚠️  Some validations failed. Please review the issues above.', 'yellow');
    if (totalIssues > 10) {
      log('💡 Consider reviewing the data extraction process.', 'cyan');
    }
  }
  
  // Exit with appropriate code
  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch(error => {
  log(`💥 Validation failed with error: ${error.message}`, 'red');
  process.exit(1);
});