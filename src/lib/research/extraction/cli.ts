#!/usr/bin/env node

import { extractArxivPaper, ResearchDataExtractor } from './index';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const arxivUrl = args[0] || 'https://arxiv.org/pdf/2507.07935';
  const outputDir = args[1] || path.join(process.cwd(), 'research');

  console.log('🔬 Research Data Extractor');
  console.log('==========================');
  console.log(`📄 Source: ${arxivUrl}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log('');

  try {
    const result = await extractArxivPaper(arxivUrl, outputDir);

    if (result.success) {
      console.log('✅ Extraction completed successfully!');
      console.log('');
      console.log('📊 Results Summary:');
      console.log(`   Tables extracted: ${result.tables.length}`);
      console.log(`   Text sections: ${Object.keys(result.extractedText.sections).length}`);
      console.log(`   PDF file: ${result.files.pdf}`);
      
      if (result.files.csvExports) {
        console.log(`   CSV exports: ${result.files.csvExports.length} files`);
      }
      
      if (result.files.textExport) {
        console.log(`   Text export: ${result.files.textExport}`);
      }

      // Quality assessment
      const extractor = new ResearchDataExtractor();
      const quality = await extractor.validateExtractionQuality(result);
      
      console.log('');
      console.log('🎯 Quality Assessment:');
      console.log(`   Overall score: ${quality.overallScore.toFixed(1)}%`);
      console.log(`   Manual review required: ${quality.requiresManualReview ? 'Yes' : 'No'}`);
      
      if (quality.recommendations.length > 0) {
        console.log('');
        console.log('💡 Recommendations:');
        quality.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }

      // Show validation details
      const tableErrors = result.validationResults.tables.errors.length;
      const tableWarnings = result.validationResults.tables.warnings.length;
      const textErrors = result.validationResults.text.errors.length;
      const textWarnings = result.validationResults.text.warnings.length;

      if (tableErrors + tableWarnings + textErrors + textWarnings > 0) {
        console.log('');
        console.log('⚠️  Validation Issues:');
        if (tableErrors > 0) console.log(`   Table errors: ${tableErrors}`);
        if (tableWarnings > 0) console.log(`   Table warnings: ${tableWarnings}`);
        if (textErrors > 0) console.log(`   Text errors: ${textErrors}`);
        if (textWarnings > 0) console.log(`   Text warnings: ${textWarnings}`);
      }

    } else {
      console.log('❌ Extraction failed!');
      console.log(`Error: ${result.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };