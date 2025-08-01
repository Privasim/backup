'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/quiz/types';
import RiskComparisonChart from '@/components/research/RiskComparisonChart';
import OccupationInsights from '@/components/research/OccupationInsights';
import IndustryExposureChart from '@/components/research/IndustryExposureChart';
import { useOccupationRisk } from '@/hooks/useResearchData';
import { assessmentIntegration } from '@/lib/research/service/assessment-integration';
import { debugLog } from '@/components/debug/DebugConsole';

interface AssessmentResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  summary: string;
  factors: {
    automation: number;
    aiReplacement: number;
    skillDemand: number;
    industryGrowth: number;
  };
  recommendations: string[];
  keyFindings?: string[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [researchData, setResearchData] = useState<any>(null);
  const [showResearchInsights, setShowResearchInsights] = useState(false);

  // Get occupation risk data from research service
  const occupationIdentifier = quizData?.jobDescription?.replace('-', ' ') || '';
  const { occupationRisk, isLoading: isLoadingOccupation } = useOccupationRisk(occupationIdentifier);

  const loadResearchData = useCallback(async (data: QuizData) => {
    debugLog.info('Assessment', 'Loading research data integration...');
    try {
      const report = await assessmentIntegration.generateRiskReport(data);
      debugLog.success('Assessment', 'Research data loaded successfully', report);
      setResearchData(report);
    } catch (error) {
      debugLog.error('Assessment', 'Failed to load research data', error, error instanceof Error ? error.stack : undefined);
      console.error('Failed to load research data:', error);
      // Set empty research data to prevent further errors
      setResearchData(null);
    }
  }, []);

  useEffect(() => {
    // Get quiz data from localStorage
    const storedData = localStorage.getItem('quizResults');
    const storedResults = localStorage.getItem('assessmentResults');
    
    if (!storedData) {
      router.push('/quiz');
      return;
    }

    const data: QuizData = JSON.parse(storedData);
    setQuizData(data);

    if (storedResults) {
      // Use real analysis results
      try {
        const analysisResult = JSON.parse(storedResults);
        const formattedResult = formatAnalysisResult(analysisResult, data);
        setResult(formattedResult);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to parse analysis results:', error);
        // Fallback to mock result
        const mockResult = generateMockResult(data);
        setResult(mockResult);
        setIsLoading(false);
      }
    } else {
      // Fallback to mock result if no analysis results
      const mockResult = generateMockResult(data);
      setResult(mockResult);
      setIsLoading(false);
    }

    // Load research data integration
    loadResearchData(data);
  }, [router, loadResearchData]);

  const formatAnalysisResult = (analysisResult: any, data: QuizData): AssessmentResult => {
    return {
      riskLevel: analysisResult.riskLevel,
      riskScore: analysisResult.riskScore,
      summary: analysisResult.summary || `Based on your profile as a ${data.jobDescription.replace('-', ' ')} with ${data.experience} in ${data.industry}, your role has a ${analysisResult.riskLevel?.toLowerCase() || 'medium'} risk of AI displacement.`,
      factors: {
        automation: analysisResult.factors?.automation || 50,
        aiReplacement: analysisResult.factors?.aiReplacement || analysisResult.riskScore || 50,
        skillDemand: analysisResult.factors?.skillDemand || (100 - (analysisResult.riskScore || 50)),
        industryGrowth: analysisResult.factors?.industryGrowth || 50
      },
      recommendations: analysisResult.recommendations || [
        'Develop AI collaboration skills',
        'Focus on creative and strategic thinking',
        'Learn emerging technologies in your field',
        'Build strong interpersonal relationships',
        'Consider upskilling in complementary areas'
      ],
      keyFindings: analysisResult.keyFindings
    };
  };

  const generateMockResult = (data: QuizData): AssessmentResult => {
    // Mock algorithm based on job type
    const riskScores = {
      'marketer': 65,
      'software-developer': 35,
      'data-analyst': 45,
      'graphic-designer': 75,
      'accountant': 80
    };

    const score = riskScores[data.jobDescription as keyof typeof riskScores] || 50;
    const riskLevel = score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';

    return {
      riskLevel,
      riskScore: score,
      summary: `Based on your profile as a ${data.jobDescription.replace('-', ' ')} with ${data.experience} in ${data.industry}, your role has a ${riskLevel.toLowerCase()} risk of AI displacement.`,
      factors: {
        automation: Math.min(score + 10, 100),
        aiReplacement: score,
        skillDemand: Math.max(100 - score, 20),
        industryGrowth: Math.random() * 40 + 40
      },
      recommendations: [
        'Develop AI collaboration skills',
        'Focus on creative and strategic thinking',
        'Learn emerging technologies in your field',
        'Build strong interpersonal relationships',
        'Consider upskilling in complementary areas'
      ]
    };
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem('quizResults');
    router.push('/quiz');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Profile</h2>
          <p className="text-gray-600">Our AI is processing your career data...</p>
        </div>
      </div>
    );
  }

  if (!result || !quizData) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CareerGuard</span>
          </div>
          <button 
            onClick={handleRetakeQuiz}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retake Assessment
          </button>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your AI Risk Assessment
            </h1>
            <p className="text-lg text-gray-600">
              Personalized insights for {quizData.jobDescription.replace('-', ' ')} in {quizData.industry}
            </p>
          </div>

          {/* Risk Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="text-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-6 ${getRiskColor(result.riskLevel)}`}>
                {result.riskLevel} Risk Level
              </div>
              
              <div className="mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">{result.riskScore}%</div>
                <div className="text-gray-600">AI Displacement Risk</div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    result.riskLevel === 'Low' ? 'bg-green-500' :
                    result.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                ></div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Factors</h3>
              
              <div className="space-y-4">
                {Object.entries(result.factors).map(([factor, score]) => (
                  <div key={factor}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-gray-900">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {quizData.jobDescription.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium text-gray-900">{quizData.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium text-gray-900">{quizData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{quizData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="font-medium text-gray-900">{quizData.salaryRange}</span>
                </div>
                <div>
                  <span className="text-gray-600">Key Skills:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quizData.skillSet.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          {result.keyFindings && result.keyFindings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Key Findings</h3>
              
              <div className="space-y-4">
                {result.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">📊</span>
                    </div>
                    <p className="text-gray-700">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research-Based Risk Comparison */}
          {occupationRisk && !isLoadingOccupation && (
            <div className="mb-8">
              <RiskComparisonChart
                data={{
                  userRisk: result.riskScore / 100,
                  benchmarkRisk: occupationRisk.occupation.riskScore,
                  occupation: occupationRisk.occupation.name,
                  percentile: occupationRisk.percentile,
                }}
                className="mb-6"
              />
            </div>
          )}

          {/* Research Insights Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowResearchInsights(!showResearchInsights)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              {showResearchInsights ? 'Hide' : 'Show'} Research-Based Insights
              <span className="ml-2">
                {showResearchInsights ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {/* Research Insights Section */}
          {showResearchInsights && (
            <div className="space-y-8 mb-8">
              {/* Occupation Insights */}
              {occupationRisk && researchData && (
                <OccupationInsights
                  occupationRisk={occupationRisk}
                  recommendations={researchData.recommendations}
                />
              )}

              {/* Industry Exposure Chart */}
              <IndustryExposureChart
                height={350}
                limit={12}
                showEmployment={false}
              />
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Recommendations</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>

            {/* Research-based recommendations */}
            {researchData?.recommendations && researchData.recommendations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Research-Based Recommendations
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {researchData.recommendations.slice(0, 4).map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-purple-600 font-semibold text-sm">📊</span>
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Take Assessment Again
                </button>
                <button className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-colors">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}