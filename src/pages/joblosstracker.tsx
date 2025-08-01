'use client';

import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { JobLossSearch } from '@/components/jobloss/JobLossSearch';
import { JobLossResults } from '@/components/jobloss/JobLossResults';
import { JobLossAnalysis } from '@/components/jobloss/JobLossAnalysis';
import { NewsItem } from '@/types/jobloss';

export default function JobLossTrackerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    
    try {
      // TODO: Implement search functionality
      // const results = await searchNews(query);
      // setNewsItems(results);
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedItems.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Implement analysis functionality
      // const results = await analyzeNews(selectedItems);
      // setAnalysisResults(prev => ({ ...prev, ...results }));
    } catch (error) {
      console.error('Error analyzing news:', error);
    } finally {
      setIsLoading(false);
    }
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
              onSelectItems={setSelectedItems}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
            
            {Object.keys(analysisResults).length > 0 && (
              <JobLossAnalysis results={analysisResults} />
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
