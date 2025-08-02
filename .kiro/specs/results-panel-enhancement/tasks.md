# Implementation Plan

## Data Source Requirements
**CRITICAL**: Use only existing ResearchDataService methods. NO mock data or false data allowed.
- `getRiskMatrixData()` - occupation/industry risk matrix
- `getIndustryData()` - industry exposure and employment data  
- `getTaskAutomationData()` - task automation potential data
- `knowledgeBase.occupations` - occupation risk scores and metadata

## Tasks

- [ ] 1. **Executive Summary Layout**
  Restructure ResultsPanel with prominent risk score + key insight + primary recommendation at top
  - Move recommendations above visualizations for action-oriented hierarchy
  - Add industry percentile to risk gauge using existing occupation data
  - _Data: results.riskScore, results.summary, results.recommendations_

- [ ] 2. **Multi-Dimensional D3 Chart** 
  Create interactive visualization combining risk/employment/automation data with drill-down
  - Use scatter plot with risk (x), employment (y), automation potential (size)
  - Drill from industry bubbles to individual occupations
  - _Data: getIndustryData() + getTaskAutomationData() + occupations_

- [ ] 3. **Cross-Chart Interactions**
  Implement shared state for coordinated filtering across all existing D3 components
  - Selections in one chart filter related data in all other charts
  - Hover highlighting shows related data points across visualizations
  - _Data: Existing visualization data with coordinated filtering_

- [ ] 4. **Comparative Benchmarking**
  Add industry averages and peer comparisons using existing occupation data
  - Calculate industry averages from knowledgeBase.occupations
  - Add benchmark overlays to existing RiskGaugeD3 and FactorBarsD3
  - _Data: Derived from existing knowledgeBase.occupations array_

- [ ] 5. **Presentation Mode**
  Add clean export-ready layout toggle and enhanced SVG export
  - Toggle removes debug elements and optimizes for presentation
  - Enhance existing SVG export with professional styling
  - _Data: Same data sources, different presentation layer_

## Integration Notes
- Preserve all existing ResearchDataService integration
- Maintain current debug logging and error handling
- Enhance existing D3 components, don't replace them
- All data must come from existing sources - no synthetic data generation