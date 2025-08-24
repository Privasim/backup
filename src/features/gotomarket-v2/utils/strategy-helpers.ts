import { GoToMarketStrategies, MarketingStrategy, SalesChannel, PricingStrategy } from '../types';

export const calculateOverallProgress = (strategies: GoToMarketStrategies): number => {
  const allItems = [
    ...strategies.marketingStrategies,
    ...strategies.salesChannels,
    ...strategies.pricingStrategies
  ];
  
  if (allItems.length === 0) return 0;
  
  const completedItems = allItems.filter(item => item.completed).length;
  return Math.round((completedItems / allItems.length) * 100);
};

export const getProgressByCategory = (strategies: GoToMarketStrategies) => {
  const calculateCategoryProgress = (items: Array<{ completed: boolean }>) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  return {
    marketing: calculateCategoryProgress(strategies.marketingStrategies),
    sales: calculateCategoryProgress(strategies.salesChannels),
    pricing: calculateCategoryProgress(strategies.pricingStrategies),
    overall: calculateOverallProgress(strategies)
  };
};

export const getStrategySummary = (strategies: GoToMarketStrategies) => {
  const progress = getProgressByCategory(strategies);
  
  return {
    totalStrategies: strategies.marketingStrategies.length + strategies.salesChannels.length + strategies.pricingStrategies.length,
    completedStrategies: [
      ...strategies.marketingStrategies,
      ...strategies.salesChannels,
      ...strategies.pricingStrategies
    ].filter(item => item.completed).length,
    progress,
    generatedAt: strategies.generatedAt,
    businessIdea: strategies.businessContext.businessIdea
  };
};

export const filterStrategiesByStatus = (
  strategies: GoToMarketStrategies,
  status: 'all' | 'completed' | 'pending'
) => {
  const filterFn = (item: { completed: boolean }) => {
    switch (status) {
      case 'completed': return item.completed;
      case 'pending': return !item.completed;
      default: return true;
    }
  };

  return {
    ...strategies,
    marketingStrategies: strategies.marketingStrategies.filter(filterFn),
    salesChannels: strategies.salesChannels.filter(filterFn),
    pricingStrategies: strategies.pricingStrategies.filter(filterFn)
  };
};

export const searchStrategies = (
  strategies: GoToMarketStrategies,
  query: string
): GoToMarketStrategies => {
  if (!query.trim()) return strategies;
  
  const searchTerm = query.toLowerCase();
  
  const searchInText = (text: string) => 
    text.toLowerCase().includes(searchTerm);
  
  const searchInArray = (arr: string[]) =>
    arr.some(item => searchInText(item));

  return {
    ...strategies,
    marketingStrategies: strategies.marketingStrategies.filter(strategy =>
      searchInText(strategy.title) ||
      searchInText(strategy.description) ||
      searchInText(strategy.type) ||
      strategy.tactics.some(tactic => 
        searchInText(tactic.name) || searchInText(tactic.description)
      )
    ),
    salesChannels: strategies.salesChannels.filter(channel =>
      searchInText(channel.name) ||
      searchInText(channel.description) ||
      searchInText(channel.type) ||
      channel.implementationSteps.some(step =>
        searchInText(step.title) || searchInText(step.description)
      )
    ),
    pricingStrategies: strategies.pricingStrategies.filter(pricing =>
      searchInText(pricing.title) ||
      searchInText(pricing.description) ||
      searchInText(pricing.model) ||
      pricing.pricePoints.some(point =>
        searchInText(point.tier) || searchInArray(point.features)
      )
    )
  };
};

export const sortStrategies = (
  strategies: GoToMarketStrategies,
  sortBy: 'name' | 'difficulty' | 'priority' | 'completion'
): GoToMarketStrategies => {
  const sortMarketingStrategies = (strategies: MarketingStrategy[]) => {
    return [...strategies].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { low: 1, medium: 2, high: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'completion':
          return Number(a.completed) - Number(b.completed);
        default:
          return 0;
      }
    });
  };

  const sortSalesChannels = (channels: SalesChannel[]) => {
    return [...channels].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          return b.suitabilityScore - a.suitabilityScore;
        case 'completion':
          return Number(a.completed) - Number(b.completed);
        default:
          return 0;
      }
    });
  };

  const sortPricingStrategies = (strategies: PricingStrategy[]) => {
    return [...strategies].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'priority':
          return b.marketFit - a.marketFit;
        case 'completion':
          return Number(a.completed) - Number(b.completed);
        default:
          return 0;
      }
    });
  };

  return {
    ...strategies,
    marketingStrategies: sortMarketingStrategies(strategies.marketingStrategies),
    salesChannels: sortSalesChannels(strategies.salesChannels),
    pricingStrategies: sortPricingStrategies(strategies.pricingStrategies)
  };
};

export const getNextActionItems = (strategies: GoToMarketStrategies, limit: number = 5) => {
  const allItems = [
    ...strategies.marketingStrategies.map(s => ({
      id: s.id,
      title: s.title,
      type: 'marketing' as const,
      completed: s.completed,
      difficulty: s.difficulty,
      priority: s.difficulty === 'low' ? 3 : s.difficulty === 'medium' ? 2 : 1
    })),
    ...strategies.salesChannels.map(s => ({
      id: s.id,
      title: s.name,
      type: 'sales' as const,
      completed: s.completed,
      priority: Math.round(s.suitabilityScore / 25) // Convert 0-100 to 1-4
    })),
    ...strategies.pricingStrategies.map(s => ({
      id: s.id,
      title: s.title,
      type: 'pricing' as const,
      completed: s.completed,
      priority: Math.round(s.marketFit / 25) // Convert 0-100 to 1-4
    }))
  ];

  return allItems
    .filter(item => !item.completed)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, limit);
};

export const estimateTotalBudget = (strategies: GoToMarketStrategies): {
  min: number;
  max: number;
  currency: string;
} => {
  let minTotal = 0;
  let maxTotal = 0;
  let currency = 'USD';

  // Extract budget from marketing strategies
  strategies.marketingStrategies.forEach(strategy => {
    const minMatch = strategy.budget.min.match(/[\d,]+/);
    const maxMatch = strategy.budget.max.match(/[\d,]+/);
    
    if (minMatch) minTotal += parseInt(minMatch[0].replace(/,/g, ''));
    if (maxMatch) maxTotal += parseInt(maxMatch[0].replace(/,/g, ''));
    
    currency = strategy.budget.currency || currency;
  });

  // Extract setup costs from sales channels
  strategies.salesChannels.forEach(channel => {
    const setupMatch = channel.costStructure.setup.match(/[\d,]+/);
    if (setupMatch) {
      const setupCost = parseInt(setupMatch[0].replace(/,/g, ''));
      minTotal += setupCost;
      maxTotal += setupCost;
    }
  });

  return { min: minTotal, max: maxTotal, currency };
};

export const generateActionPlan = (strategies: GoToMarketStrategies) => {
  const nextActions = getNextActionItems(strategies, 10);
  const progress = getProgressByCategory(strategies);
  const budget = estimateTotalBudget(strategies);

  return {
    nextActions,
    progress,
    budget,
    recommendations: [
      progress.marketing < 50 ? 'Focus on completing marketing strategies first' : null,
      progress.sales < 30 ? 'Prioritize sales channel setup' : null,
      progress.pricing < 25 ? 'Finalize pricing strategy early' : null,
      budget.min > 50000 ? 'Consider phased implementation to manage budget' : null
    ].filter(Boolean)
  };
};