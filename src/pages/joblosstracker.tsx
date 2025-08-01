'use client';

import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { JobLossSearch } from '@/components/jobloss/JobLossSearch';
import { JobLossResults } from '@/components/jobloss/JobLossResults';
import { JobLossAnalysis } from '@/components/jobloss/JobLossAnalysis';
import { useJobLossTracker } from '@/hooks/useJobLossTracker';
import { AnalysisResult } from '@/types/jobloss';

export default function JobLossTrackerPage() {
  const {
    searchQuery,
    searchResults: newsItems,
    isLoading,
    error,
    selectedItems,
    analysisResults,
    setSearchQuery,
    searchNews,
    toggleSelectItem,
    toggleSelectAll,
    analyzeSelected,
  } = useJobLossTracker();

  const handleSearch = async (query: string, filters?: any) => {
    setSearchQuery(query);
    await searchNews();
  };

  const handleAnalyze = async () => {
    await analyzeSelected();
  };

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Job Loss Tracker | AI Impact Monitor</title>
        <meta name="description" content="Track and analyze job losses due to AI" />
      </Head>

      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Job Loss Tracker
        </Typography>
        
        <JobLossSearch 
          onSearch={handleSearch} 
          isLoading={isLoading}
          error={error}
          lastSearchedQuery={searchQuery}
        />
        
        {isLoading && !newsItems.length ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <JobLossResults 
              items={newsItems}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelectItem}
              onSelectAll={toggleSelectAll}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              isAnalyzing={false}
              analysisError={null}
              hasAnalysisResults={analysisResults.length > 0}
            />
            
            {analysisResults.length > 0 && (
              <JobLossAnalysis results={(analysisResults as AnalysisResult[]).reduce((acc, result) => {
                acc[result.articleId] = result;
                return acc;
              }, {} as Record<string, AnalysisResult>)} />
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
