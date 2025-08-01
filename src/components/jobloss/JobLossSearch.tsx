import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Collapse, 
  Typography, 
  IconButton,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Stack,
  Tooltip,
  Alert,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';

interface JobLossSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  isLoading?: boolean;
  error?: string | null;
  lastSearchedQuery?: string;
  className?: string;
}

interface SearchFilters {
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
  region?: string;
  industry?: string;
  sortBy?: 'relevance' | 'date';
}

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Customer Service',
  'Transportation',
  'Media',
  'Other'
];

const REGIONS = [
  'Global',
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Oceania'
];

export function JobLossSearch({ 
  onSearch, 
  isLoading = false, 
  error,
  lastSearchedQuery,
  className = ''
}: JobLossSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    timeframe: 'month',
    region: 'Global',
    industry: '',
    sortBy: 'relevance'
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), filters);
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Auto-search when filters change if we have an active search
    if (searchQuery.trim() && searchQuery === lastSearchedQuery) {
      onSearch(searchQuery.trim(), newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      ...filters,
      industry: '',
      region: 'Global',
      timeframe: 'month',
    };
    setFilters(clearedFilters);
    
    // Re-trigger search with cleared filters if we have an active search
    if (searchQuery.trim() && searchQuery === lastSearchedQuery) {
      onSearch(searchQuery.trim(), clearedFilters);
    }
  };

  const hasActiveFilters = filters.industry || 
                         filters.region !== 'Global' || 
                         filters.timeframe !== 'month';

  return (
    <Paper 
      component="form" 
      onSubmit={handleSearch}
      elevation={2}
      className={className}
      sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 },
        mb: 3,
        borderRadius: 3,
        background: (theme) => 
          `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`,
        backdropFilter: 'blur(8px)',
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: (theme) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for AI job loss news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: (theme) => ({
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                },
                '&.Mui-focused': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                },
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
              }),
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading || !searchQuery.trim()}
            sx={{ 
              minWidth: { xs: '100%', sm: 140 },
              height: 56, // Match TextField height
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 20px 0 rgba(0, 118, 255, 0.3)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? 'Searching...' : 'Get News'}
          </Button>
        </Box>

        {/* Active filters */}
        {hasActiveFilters && (
          <Box mt={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {filters.timeframe && filters.timeframe !== 'month' && (
                <Chip
                  label={`Time: ${filters.timeframe}`}
                  onDelete={() => handleFilterChange('timeframe', 'month')}
                  size="small"
                  icon={<DateRangeIcon fontSize="small" />}
                />
              )}
              {filters.region && filters.region !== 'Global' && (
                <Chip
                  label={`Region: ${filters.region}`}
                  onDelete={() => handleFilterChange('region', 'Global')}
                  size="small"
                  icon={<LocationOnIcon fontSize="small" />}
                />
              )}
              {filters.industry && (
                <Chip
                  label={`Industry: ${filters.industry}`}
                  onDelete={() => handleFilterChange('industry', '')}
                  size="small"
                  icon={<BusinessIcon fontSize="small" />}
                />
              )}
              <Button 
                size="small" 
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{ ml: 'auto' }}
              >
                Clear filters
              </Button>
            </Stack>
          </Box>
        )}

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {/* Advanced options */}
        <Box>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent',
              },
            }}
          >
            {showAdvanced ? 'Hide' : 'Advanced'} options
          </Button>
        </Box>
      </Box>

      <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
        <Box 
          mt={2} 
          pt={2} 
          borderTop="1px solid" 
          borderColor="divider"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="timeframe-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-label"
              value={filters.timeframe}
              label="Timeframe"
              onChange={(e: SelectChangeEvent) => 
                handleFilterChange('timeframe', e.target.value as any)
              }
              startAdornment={
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <DateRangeIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="day">Last 24 hours</MenuItem>
              <MenuItem value="week">Last week</MenuItem>
              <MenuItem value="month">Last month</MenuItem>
              <MenuItem value="year">Last year</MenuItem>
              <MenuItem value="all">All time</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="region-label">Region</InputLabel>
            <Select
              labelId="region-label"
              value={filters.region}
              label="Region"
              onChange={(e: SelectChangeEvent) => 
                handleFilterChange('region', e.target.value as string)
              }
              startAdornment={
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="industry-label">Industry</InputLabel>
            <Select
              labelId="industry-label"
              value={filters.industry}
              label="Industry"
              onChange={(e: SelectChangeEvent) => 
                handleFilterChange('industry', e.target.value as string)
              }
              startAdornment={
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>All Industries</em>
              </MenuItem>
              {INDUSTRIES.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="sortby-label">Sort by</InputLabel>
            <Select
              labelId="sortby-label"
              value={filters.sortBy}
              label="Sort by"
              onChange={(e: SelectChangeEvent) => 
                handleFilterChange('sortBy', e.target.value as any)
              }
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="date">Most recent</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                <Box component="span" display="flex" alignItems="center">
                  <HelpOutlineIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                  Tip: Use specific keywords like "AI layoffs [company]" or "automation job losses [industry]"
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
