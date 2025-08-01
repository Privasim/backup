#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}`, 'cyan');
  log(`Running: ${command}`, 'blue');
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function checkTestFiles() {
  const testDirs = [
    'src/lib/research/extraction/__tests__',
    'src/lib/research/processing/__tests__',
    'src/lib/research/service/__tests__',
    'src/lib/research/__tests__',
    'src/components/research/__tests__',
    'src/hooks/__tests__',
  ];

  log('\n📁 Checking test file structure...', 'cyan');
  
  let totalTests = 0;
  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
      log(`  ${dir}: ${files.length} test files`, 'blue');
      totalTests += files.length;
    } else {
      log(`  ${dir}: Directory not found`, 'yellow');
    }
  });
  
  log(`\n📊 Total test files: ${totalTests}`, 'bright');
  return totalTests > 0;
}

function generateTestReport() {
  log('\n📋 Generating test report...', 'cyan');
  
  const reportPath = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportPath, `test-report-${timestamp}.json`);
  
  // This would be populated by Jest in a real scenario
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
    testSuites: [],
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  log(`📄 Test report saved to: ${reportFile}`, 'green');
}

function main() {
  log('🧪 Research Data Testing Suite', 'bright');
  log('================================', 'bright');
  
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  // Check if test files exist
  if (!checkTestFiles()) {
    log('\n⚠️  No test files found. Please ensure tests are created.', 'yellow');
    process.exit(1);
  }
  
  let success = true;
  
  switch (testType) {
    case 'unit':
      log('\n🔬 Running Unit Tests Only', 'magenta');
      success = runCommand(
        'npm test -- --testPathPattern="__tests__" --testNamePattern="^((?!integration).)*$"',
        'Unit Tests'
      );
      break;
      
    case 'integration':
      log('\n🔗 Running Integration Tests Only', 'magenta');
      success = runCommand(
        'npm test -- --testPathPattern="integration.test"',
        'Integration Tests'
      );
      break;
      
    case 'components':
      log('\n⚛️  Running Component Tests Only', 'magenta');
      success = runCommand(
        'npm test -- --testPathPattern="components.*__tests__"',
        'Component Tests'
      );
      break;
      
    case 'coverage':
      log('\n📊 Running Tests with Coverage', 'magenta');
      success = runCommand(
        'npm test -- --coverage --watchAll=false',
        'Tests with Coverage'
      );
      break;
      
    case 'watch':
      log('\n👀 Running Tests in Watch Mode', 'magenta');
      success = runCommand(
        'npm test -- --watch',
        'Tests in Watch Mode'
      );
      break;
      
    case 'ci':
      log('\n🤖 Running Tests for CI', 'magenta');
      success = runCommand(
        'npm test -- --coverage --watchAll=false --ci --reporters=default --reporters=jest-junit',
        'CI Tests'
      );
      generateTestReport();
      break;
      
    case 'all':
    default:
      log('\n🎯 Running All Tests', 'magenta');
      
      // Run unit tests
      success = runCommand(
        'npm test -- --testPathPattern="__tests__" --testNamePattern="^((?!integration).)*$" --watchAll=false',
        'Unit Tests'
      ) && success;
      
      // Run integration tests
      success = runCommand(
        'npm test -- --testPathPattern="integration.test" --watchAll=false',
        'Integration Tests'
      ) && success;
      
      // Run component tests
      success = runCommand(
        'npm test -- --testPathPattern="components.*__tests__" --watchAll=false',
        'Component Tests'
      ) && success;
      
      // Generate coverage report
      if (success) {
        runCommand(
          'npm test -- --coverage --watchAll=false --silent',
          'Coverage Report Generation'
        );
      }
      break;
  }
  
  // Final summary
  log('\n' + '='.repeat(50), 'bright');
  if (success) {
    log('🎉 All tests completed successfully!', 'green');
    log('\n📈 Next steps:', 'cyan');
    log('  • Review coverage report in coverage/ directory', 'blue');
    log('  • Check for any warnings or recommendations', 'blue');
    log('  • Consider adding more edge case tests', 'blue');
  } else {
    log('💥 Some tests failed!', 'red');
    log('\n🔧 Troubleshooting:', 'cyan');
    log('  • Check test output above for specific failures', 'blue');
    log('  • Ensure all dependencies are installed', 'blue');
    log('  • Verify test environment setup', 'blue');
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('🧪 Research Data Testing Suite', 'bright');
  log('\nUsage: node scripts/test-runner.js [type]', 'cyan');
  log('\nTest Types:', 'yellow');
  log('  all         - Run all tests (default)', 'blue');
  log('  unit        - Run unit tests only', 'blue');
  log('  integration - Run integration tests only', 'blue');
  log('  components  - Run component tests only', 'blue');
  log('  coverage    - Run tests with coverage report', 'blue');
  log('  watch       - Run tests in watch mode', 'blue');
  log('  ci          - Run tests for CI environment', 'blue');
  log('\nExamples:', 'yellow');
  log('  node scripts/test-runner.js unit', 'blue');
  log('  node scripts/test-runner.js coverage', 'blue');
  log('  node scripts/test-runner.js watch', 'blue');
  process.exit(0);
}

main();