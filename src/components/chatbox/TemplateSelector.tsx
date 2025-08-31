import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { PromptTemplate, TemplateCategory } from '../../lib/chatbox/prompts/types';
import { promptManager } from '../../lib/chatbox/prompts/PromptManager';

interface TemplateSelectorProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onEditTemplate?: (template: PromptTemplate) => void;
  onDeleteTemplate?: (template: PromptTemplate) => void;
  selectedTemplateId?: string;
}

const CATEGORIES: { [key in TemplateCategory]: string } = {
  'tone': 'Tone & Style',
  'analysis': 'Analysis',
  'focus': 'Focus',
  'custom': 'Custom'
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onEditTemplate,
  onDeleteTemplate,
  selectedTemplateId
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        await promptManager.initialize();
        const allTemplates = await promptManager.getAllTemplates();
        setTemplates(allTemplates);
        setFilteredTemplates(allTemplates);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteTemplates');
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates when search query or category changes
  useEffect(() => {
    let filtered = [...templates];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  // Toggle favorite status
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify([...newFavorites]));
  };

  // Handle category tab change
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: TemplateCategory | 'all') => {
    setSelectedCategory(newValue);
  };

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Render template list
  const renderTemplateList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
            Loading templates...
          </Typography>
        </Box>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <Box p={3} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            No templates found. Try adjusting your search or category filter.
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
        {filteredTemplates.map((template) => (
          <ListItem 
            key={template.id}
            button 
            selected={selectedTemplateId === template.id}
            onClick={() => onSelectTemplate(template)}
            sx={{
              borderLeft: selectedTemplateId === template.id ? '3px solid #1976d2' : 'none',
              backgroundColor: selectedTemplateId === template.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle2" component="span">
                    {template.name}
                  </Typography>
                  {template.isBuiltIn && (
                    <Chip 
                      label="Built-in" 
                      size="small" 
                      variant="outlined"
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block', fontSize: '0.8rem' }}>
                    {promptManager.getTemplatePreview(template, 80)}
                  </Typography>
                  <Box mt={0.5}>
                    {template.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    ))}
                    {template.tags.length > 3 && (
                      <Chip 
                        label={`+${template.tags.length - 3}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title={favorites.has(template.id) ? "Remove from favorites" : "Add to favorites"}>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                >
                  {favorites.has(template.id) ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              
              {template.isEditable && onEditTemplate && (
                <Tooltip title="Edit template">
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTemplate(template);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {template.isEditable && onDeleteTemplate && (
                <Tooltip title="Delete template">
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTemplate(template);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title={template.description}>
                <IconButton edge="end" size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Box p={2} pb={1}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Tabs 
        value={selectedCategory} 
        onChange={handleCategoryChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All" value="all" />
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <Tab key={key} label={label} value={key} />
        ))}
      </Tabs>
      
      {renderTemplateList()}
    </Box>
  );
};