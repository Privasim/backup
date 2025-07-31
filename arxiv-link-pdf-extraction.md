# arXiv Paper Data Extraction & Knowledge Base Integration Plan

**Priority: DATA EXTRACTION**

## Overview
This document details the modular, optimal implementation plan for extracting structured research data from the arXiv paper [The Impact of Generative AI on Employment](https://arxiv.org/pdf/2507.07935) and integrating it as a static JSON knowledge base for visualization and assessment.

---

## 1. Paper Analysis & Data Mapping

### Target Paper
- **Title**: The Impact of Generative AI on Employment
- **arXiv Link**: https://arxiv.org/pdf/2507.07935
- **Key Extraction Sections**:
  - Abstract & Introduction (context)
  - Methodology (for confidence, limitations)
  - Results (ALL tables, especially occupation risk data)
  - Discussion (key insights)

### Data Structure Design

#### Core JSON Schema
- `metadata`: Paper info, extraction date, version
- `methodology`: Data sources, analysis approach, confidence
- `occupations`: List of occupation objects with risk and key tasks
- `tables`: **All tables** from the paper, in structured format
- `visualizations`: Bar chart config for front-end

---

## 2. DATA EXTRACTION PROCESS (**PRIORITY**)

### 2.1 Initial Setup
- Download the PDF to `/research/raw/`
- Prepare extraction tools:
  - Tabula (for tables)
  - pdftotext (for text)
  - Manual review for accuracy

### 2.2 Extraction Workflow

#### Step 1: Table Extraction (**Highest Priority**)
- Use Tabula or similar to extract every table in the paper
- Save each table as CSV for review
- Map each table to a JSON structure:
  - `id`, `title`, `page`, `data` (rows), `footnotes`
- Validate all numerical and categorical data

#### Step 2: Text & Context Extraction
- Use pdftotext or manual copy for:
  - Abstract
  - Methodology
  - Notes/limitations
- Extract relevant paragraphs and map to JSON fields

#### Step 3: Data Normalization
- Standardize occupation names and codes
- Ensure all tables are referenced and cross-linked
- Add citations and notes for traceability

#### Step 4: Quality Assurance
- Cross-check all extracted data with original PDF
- Validate JSON schema (completeness, correctness)
- Document any ambiguities or extraction issues

---

## 3. Integration Plan

### 3.1 Knowledge Base Storage
- Place final JSON in `/src/lib/research/data/ai_employment_risks.json`
- Version and date-stamp each extraction

### 3.2 Data Loading Service
- Service to load JSON and provide access by occupation, table, or visualization config

### 3.3 Visualization Component
- Bar chart comparing user risk with paper's occupation risk
- Data source: extracted tables in JSON

---

## 4. Maintenance & Update Strategy
- Store raw and processed data in version control
- Document extraction and update process
- Validate and update JSON as new versions of the paper are published

---

## 5. Testing & Validation
- Unit test data loading and occupation lookup
- Integration test visualization with real data
- Manual review of table extraction accuracy

---

## 6. Future Extensions
- Support for additional papers and tables
- Advanced analytics and cross-paper comparisons
- Interactive filtering and scenario modeling

---

**Note:** The extraction of ALL tables from the paper and accurate mapping to JSON is the highest priority. All downstream features depend on the completeness and correctness of this step.
