import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  IconButton, 
  InputAdornment, 
  Tooltip,
  Paper,
  Collapse,
  Alert,
  AlertTitle,
  Link
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  HelpOutline,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

interface ApiKeyManagerProps {
  apiKey: string;
  onApiKeyChange: (key: string) => boolean;
  isApiKeyValid: boolean;
  onValidate?: (isValid: boolean) => void;
  showHelpText?: boolean;
  fullWidth?: boolean;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKey,
  onApiKeyChange,
  isApiKeyValid,
  onValidate,
  showHelpText = true,
  fullWidth = false,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [isTouched, setIsTouched] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setLocalKey(value);
    setIsTouched(true);
    
    // Only validate if the input is not empty
    if (value) {
      const isValid = onApiKeyChange(value);
      onValidate?.(isValid);
    } else {
      onApiKeyChange('');
      onValidate?.(false);
    }
  };

  const handleBlur = () => {
    if (localKey) {
      const isValid = onApiKeyChange(localKey);
      onValidate?.(isValid);
    }
  };

  const toggleKeyVisibility = () => {
    setShowKey(!showKey);
  };

  const getHelperText = () => {
    if (!isTouched) return ' '; // Maintain consistent spacing
    if (!localKey) return 'API key is required';
    if (!isApiKeyValid) return 'Invalid API key format';
    return 'API key is valid';
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        label="OpenRouter API Key"
        type={showKey ? 'text' : 'password'}
        value={localKey}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth={fullWidth}
        margin="normal"
        variant="outlined"
        error={isTouched && (!localKey || !isApiKeyValid)}
        helperText={getHelperText()}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={showKey ? 'Hide API key' : 'Show API key'}>
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleKeyVisibility}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Help">
                <IconButton
                  aria-label="help"
                  onClick={() => setShowHelp(!showHelp)}
                  edge="end"
                >
                  <HelpOutline />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          startAdornment: isTouched && localKey && (
            <InputAdornment position="start">
              {isApiKeyValid ? (
                <CheckCircle color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ),
        }}
      />

      <Collapse in={showHelp}>
        <Paper elevation={0} sx={{ 
          mt: 1, 
          p: 2, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <Typography variant="subtitle2" gutterBottom>
            About OpenRouter API Keys
          </Typography>
          <Typography variant="body2" paragraph>
            Your OpenRouter API key is required to analyze news articles. 
            The key is stored locally in your browser and never sent to our servers.
          </Typography>
          <Typography variant="body2" gutterBottom>
            To get an API key:
          </Typography>
          <ol style={{ margin: '0 0 8px 16px', padding: 0 }}>
            <li>Sign up at <Link href="https://openrouter.ai/" target="_blank" rel="noopener">OpenRouter.ai</Link></li>
            <li>Go to your <Link href="https://openrouter.ai/keys" target="_blank" rel="noopener">API Keys</Link> page</li>
            <li>Create a new key and paste it above</li>
          </ol>
          <Alert severity="info" sx={{ mt: 1 }}>
            <AlertTitle>Free Tier Available</AlertTitle>
            OpenRouter offers free tier access to several models. No credit card required to get started.
          </Alert>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ApiKeyManager;
