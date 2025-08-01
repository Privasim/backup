import { Box, Typography, Paper, Divider, Chip, Grid, Card, CardContent } from '@mui/material';
import { AnalysisResult } from '@/types/jobloss';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import BusinessIcon from '@mui/icons-material/Business';
import InsightsIcon from '@mui/icons-material/Insights';
import { format } from 'date-fns';

interface JobLossAnalysisProps {
  results: Record<string, AnalysisResult>;
}
const ImpactChip = styled(Chip)(({ theme, color }) => ({
  fontWeight: 600,
  '&.MuiChip-colorLow': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.MuiChip-colorMedium': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.MuiChip-colorHigh': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

export function JobLossAnalysis({ results }: JobLossAnalysisProps) {
  const analysisResults = Object.values(results);
  
  if (analysisResults.length === 0) {
    return null;
  }

  const getImpactColor = (impactLevel: string) => {
    switch (impactLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'success';
    }
  };

  const getImpactIcon = (impactLevel: string) => {
    switch (impactLevel) {
      case 'high':
        return <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />;
      case 'medium':
        return <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />;
      case 'low':
      default:
        return <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />;
    }
  };

  return (
    <Box mt={6}>
      <Box display="flex" alignItems="center" mb={3}>
        <InsightsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2">
          Analysis Results
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {analysisResults.map((result) => (
          <Grid item xs={12} key={result.id}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Analysis for Article
                    </Typography>
                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                      <Chip
                        icon={getImpactIcon(result.impactLevel)}
                        label={`${result.impactLevel.toUpperCase()} IMPACT`}
                        color={getImpactColor(result.impactLevel) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<TimelineIcon fontSize="small" />}
                        label={format(new Date(result.timestamp), 'MMM d, yyyy h:mm a')}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography variant="body1" paragraph>
                    {result.summary}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <BusinessIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2">Companies Affected</Typography>
                      </Box>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {result.companies.length > 0 ? (
                          result.companies.map((company) => (
                            <Chip
                              key={company}
                              label={company}
                              size="small"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No specific companies identified
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Job Impact
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {result.jobLossCount ? `${result.jobLossCount.toLocaleString()}+` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.jobLossCount
                          ? 'Estimated jobs affected'
                          : 'No specific job loss data available'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {result.keyInsights.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Insights
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {result.keyInsights.map((insight, index) => (
                        <li key={index}>
                          <Typography variant="body2" paragraph>
                            {insight}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
