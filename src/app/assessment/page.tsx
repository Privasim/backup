'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/quiz/types';
import RiskGauge from '@/components/assessment/RiskGauge';
import FactorsChart from '@/components/assessment/FactorsChart';
import SkillsImpactChart from '@/components/assessment/SkillsImpactChart';
import TimelineChart from '@/components/assessment/TimelineChart';
import { exportToPDF, exportToJSON, shareResults, ExportData } from '@/lib/assessment/export';

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
  }, [router]);

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
    localStorage.removeItem('assessmentResults');
    router.push('/quiz');
  };

  const handleExport = async (format: 'pdf' | 'json') => {
    if (!result || !quizData) return;
    
    const exportData: ExportData = {
      profile: quizData,
      assessment: result,
      exportDate: new Date().toISOString()
    };

    if (format === 'pdf') {
      await exportToPDF(exportData);
    } else {
      exportToJSON(exportData);
    }
  };

  const handleShare = async () => {
    if (!result || !quizData) return;
    
    const exportData: ExportData = {
      profile: quizData,
      assessment: result,
      exportDate: new Date().toISOString()
    };

    await shareResults(exportData);
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
            <div className="text-center mb-8">
              <RiskGauge 
                score={result.riskScore} 
                level={result.riskLevel}
                size="lg"
                animated={true}
              />
            </div>
            
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-gray-700 text-lg leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Factors Analysis</h3>
              <FactorsChart factors={result.factors} animated={true} />
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

          {/* Skills Impact Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Skills Impact Analysis</h3>
            <SkillsImpactChart skills={quizData.skillSet} animated={true} />
          </div>

          {/* Timeline Prediction */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">AI Impact Timeline</h3>
            <TimelineChart 
              jobRole={quizData.jobDescription.replace('-', ' ')} 
              industry={quizData.industry}
              animated={true}
            />
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

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Take Assessment Again
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Report</span>
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="px-4 py-3 border border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}