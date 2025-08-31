import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
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
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-500">
            Loading templates...
          </span>
        </div>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <div className="p-6 text-center">
          <span className="text-sm text-gray-500">
            No templates found. Try adjusting your search or category filter.
          </span>
        </div>
      );
    }

    return (
      <div className="w-full max-h-[400px] overflow-y-auto">
        {filteredTemplates.map((template) => (
          <div 
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`p-3 cursor-pointer border-l-[3px] transition-colors ${selectedTemplateId === template.id 
              ? 'border-l-blue-600 bg-blue-50' 
              : 'border-l-transparent hover:bg-gray-50'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {template.name}
                  </span>
                  {template.isBuiltIn && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Built-in
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {promptManager.getTemplatePreview(template, 80)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span 
                      className="px-2 py-0.5 text-xs rounded-md border border-gray-200 text-gray-600"
                    >
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  title={favorites.has(template.id) ? "Remove from favorites" : "Add to favorites"}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                >
                  {favorites.has(template.id) 
                    ? <StarIconSolid className="h-4 w-4 text-blue-600" /> 
                    : <StarIcon className="h-4 w-4 text-gray-500" />}
                </button>
                
                {template.isEditable && onEditTemplate && (
                  <button
                    title="Edit template"
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTemplate(template);
                    }}
                  >
                    <PencilIcon className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                
                {template.isEditable && onDeleteTemplate && (
                  <button
                    title="Delete template"
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTemplate(template);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                
                <button 
                  title={template.description}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white">
      <div className="p-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-4 overflow-x-auto hide-scrollbar" aria-label="Template categories">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as TemplateCategory)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${selectedCategory === key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      
      {renderTemplateList()}
    </div>
  );
};