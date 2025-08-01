import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  CircularProgress, 
  Link,
  Chip,
  Stack,
  Divider,
  Paper,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  LinearProgress,
  Grid,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SourceIcon from '@mui/icons-material/Source';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { NewsItem } from '@/types/jobloss';

interface JobLossResultsProps {
  items: NewsItem[];
  selectedItems: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  hasAnalysisResults: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function JobLossResults({
  items,
  selectedItems,
  onToggleSelect,
  onSelectAll,
  onAnalyze,
  isAnalyzing,
  analysisError,
  hasAnalysisResults,
  className,
  isLoading,
  error,
}: JobLossResultsProps) {
  const theme = useTheme();
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    onSelectAll(isChecked);
  }, [onSelectAll]);

  const handleSelectItem = useCallback((id: string) => {
    onToggleSelect(id);
  }, [onToggleSelect]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (items.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No news articles found. Try adjusting your search query.
        </Typography>
      </Paper>
    );
  }

  // Handle loading state with animation
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              mb: 1,
              background: 'linear-gradient(90deg, #3f51b5, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            Fetching the latest job loss news
          </Typography>
          <Typography variant="body1" color="textSecondary">
            This may take a moment...
          </Typography>
        </Box>
      </motion.div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>Error Loading News</AlertTitle>
        {error}
      </Alert>
    );
  }

  // Handle empty state
  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
        <ArticleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>No job loss news found</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Try adjusting your search filters or check back later for updates.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAll}
                indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                color="primary"
              />
            }
            label={`Select all (${selectedItems.length}/${items.length})`}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={onAnalyze}
            disabled={selectedItems.length === 0 || isAnalyzing}
            startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isAnalyzing ? 'Analyzing...' : `Analyze Selected (${selectedItems.length})`}
          </Button>
        </Box>
      </Paper>
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box 
              sx={{ 
                width: '100%', 
                mb: 2,
                p: 2,
                borderRadius: 1,
                background: 'linear-gradient(90deg, #f8f9ff 0%, #f0f2ff 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <CircularProgress size={20} thickness={4} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Analyzing {selectedItems.length} article{selectedItems.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={0} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
                    borderRadius: 3
                  }
                }} 
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                This may take a few moments...
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box 
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.1
            }
          },
          hidden: { opacity: 0 }
        }}
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 3 
        }}
      >
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.05
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
            <Card 
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: selectedItems.includes(item.id) 
                  ? theme.palette.primary.main 
                  : 'divider',
                borderWidth: selectedItems.includes(item.id) ? 2 : 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="flex-start">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    disabled={isAnalyzing}
                    color="primary"
                    sx={{ mt: -1, ml: -1 }}
                  />
                  
                  <Box flexGrow={1}>
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      <Link 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        color="text.primary"
                        underline="hover"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        {item.title}
                        <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
                      </Link>
                    </Typography>
                    
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        mb: 1.5,
                        '& svg': {
                          fontSize: '1rem',
                          mr: 0.5,
                          opacity: 0.7,
                        },
                      }}
                    >
                      <CalendarTodayIcon />
                      {new Date(item.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      
                      {item.source && (
                        <>
                          <Divider orientation="vertical" flexItem sx={{ mx: 1.5 }} />
                          <SourceIcon />
                          {item.source}
                        </>
                      )}
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.6,
                      }}
                    >
                      {item.snippet || 'No description available.'}
                    </Typography>
                    
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center"
                      mt="auto"
                      pt={1}
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => onToggleSelect(item.id)}
                        sx={{ 
                          textTransform: 'none',
                          color: selectedItems.includes(item.id) 
                            ? theme.palette.error.main 
                            : 'primary.main',
                          '&:hover': {
                            backgroundColor: alpha(
                              selectedItems.includes(item.id)
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                              0.08
                            ),
                          },
                        }}
                        disabled={isAnalyzing}
                      >
                        {selectedItems.includes(item.id) ? 'Deselect' : 'Select'}
                      </Button>
                      
                      {item.jobLossCount && (
                        <Chip
                          label={`${item.jobLossCount} jobs affected`}
                          color="error"
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
      
      {selectedItems.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{
            position: 'sticky',
            bottom: 24,
            left: 0,
            right: 0,
            p: 2,
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            zIndex: theme.zIndex.speedDial,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[6],
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {selectedItems.length} {selectedItems.length === 1 ? 'article' : 'articles'} selected
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
              Ready for analysis
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            startIcon={
              isAnalyzing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleOutlineIcon />
              )
            }
            size="large"
            sx={{
              color: 'primary.main',
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1,
            }}
          >
            {isAnalyzing 
              ? `Analyzing ${selectedItems.length} ${selectedItems.length === 1 ? 'article' : 'articles'}...`
              : `Analyze ${selectedItems.length} ${selectedItems.length === 1 ? 'article' : 'articles'}`}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
