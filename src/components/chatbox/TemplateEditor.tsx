import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { PromptTemplate, TemplateCategory, ValidationResult } from '../../lib/chatbox/prompts/types';
import { promptManager } from '../../lib/chatbox/prompts/PromptManager';

interface TemplateEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: PromptTemplate) => void;
  template?: PromptTemplate; // If provided, we're editing an existing template
}

const CATEGORIES: { [key in TemplateCategory]: string } = {
  'tone': 'Tone & Style',
  'analysis': 'Analysis',
  'focus': 'Focus',
  'custom': 'Custom'
};

const INITIAL_TEMPLATE: Partial<PromptTemplate> = {
  name: '',
  description: '',
  content: '',
  category: 'custom',
  tags: []
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  open,
  onClose,
  onSave,
  template
}) => {
  const [formData, setFormData] = useState<Partial<PromptTemplate>>(INITIAL_TEMPLATE);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [newTag, setNewTag] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);
  
  const isEditMode = !!template;

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        tags: [...template.tags]
      });
      setCharacterCount(template.content.length);
    } else {
      setFormData(INITIAL_TEMPLATE);
      setCharacterCount(0);
    }
    
    setValidationResult({ isValid: true, errors: [], warnings: [] });
  }, [template, open]);

  // Handle input changes
  const handleInputChange = (field: keyof PromptTemplate, value: string | string[]) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    if (field === 'content') {
      setCharacterCount(value.toString().length);
    }
    
    // Validate on change
    const result = promptManager.validateTemplate(updatedFormData);
    setValidationResult(result);
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (!newTag.trim() || (formData.tags?.includes(newTag.trim()) ?? false)) {
      return;
    }
    
    const updatedTags = [...(formData.tags || []), newTag.trim()];
    handleInputChange('tags', updatedTags);
    setNewTag('');
  };

  // Handle tag deletion
  const handleDeleteTag = (tagToDelete: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToDelete) || [];
    handleInputChange('tags', updatedTags);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Final validation
    const result = promptManager.validateTemplate(formData);
    setValidationResult(result);
    
    if (!result.isValid) {
      return;
    }
    
    setSaving(true);
    
    try {
      let savedTemplate: PromptTemplate | null = null;
      
      if (isEditMode && template) {
        // Update existing template
        const updateResult = await promptManager.updateTemplate(template.id, formData);
        savedTemplate = updateResult.template;
      } else {
        // Create new template
        const createResult = await promptManager.createTemplate(formData);
        savedTemplate = createResult.template;
      }
      
      if (savedTemplate) {
        onSave(savedTemplate);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      setValidationResult({
        isValid: false,
        errors: ['Failed to save template. Please try again.'],
        warnings: []
      });
    } finally {
      setSaving(false);
    }
  };

  // Format character count
  const formatCharacterCount = (count: number, max: number): string => {
    return `${count.toLocaleString()} / ${max.toLocaleString()}`;
  };

  // Get color based on character count
  const getCharacterCountColor = (count: number, max: number): string => {
    if (count > max) return 'error.main';
    if (count > max * 0.9) return 'warning.main';
    return 'text.secondary';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Template' : 'Create New Template'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Validation Messages */}
        {validationResult.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {validationResult.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Warning</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {/* Template Name */}
        <TextField
          label="Template Name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          fullWidth
          margin="normal"
          required
          helperText="A short, descriptive name for your template"
        />
        
        {/* Template Description */}
        <TextField
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          rows={2}
          helperText="A brief description of what this template does"
        />
        
        {/* Template Category */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category || 'custom'}
            onChange={(e) => handleInputChange('category', e.target.value as TemplateCategory)}
            label="Category"
          >
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
          <FormHelperText>Choose a category that best describes your template</FormHelperText>
        </FormControl>
        
        {/* Template Tags */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>Tags</Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <TextField
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddTag}
              variant="outlined"
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {formData.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
          </Box>
          <FormHelperText>Add tags to help categorize and find your template</FormHelperText>
        </Box>
        
        {/* Template Content */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>Template Content</Typography>
          <TextField
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            fullWidth
            multiline
            rows={10}
            placeholder="Enter your system prompt template here..."
            variant="outlined"
            required
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <FormHelperText>
              Write your system prompt template. Use clear instructions and be specific about the desired output.
            </FormHelperText>
            <Typography 
              variant="caption" 
              color={getCharacterCountColor(characterCount, 5000)}
            >
              {formatCharacterCount(characterCount, 5000)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!validationResult.isValid || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};