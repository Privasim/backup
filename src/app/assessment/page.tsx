'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/quiz/types';
import RiskGauge from '@/components/assessment/RiskGauge';
import FactorsChart from '@/components/assessment/FactorsChart';
import SkillsImpactChart from '@/components/assessment/SkillsImpactChart';
import TimelineChart from '@/components/assessment/TimelineChart';
import { exportToPDF, exportToJSON, shareResults, ExportData } from '@/lib/assessment/export';
import { AssessmentResult } from '@/lib/assessment/types';

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
        // Redirect back to quiz if analysis results are invalid
        router.push('/quiz');
        return;
      }
    } else {
      // Redirect back to quiz if no analysis results exist
      router.push('/quiz');
      return;
    }
  }, [router]);

  const formatAnalysisResult = (analysisResult: unknown, data: QuizData): AssessmentResult => {
    const result = analysisResult as Record<string, unknown>;
    
    return {
      riskLevel: (result.riskLevel as 'Low' | 'Medium' | 'High') || 'Medium',
      riskScore: (result.riskScore as number) || 50,
      summary: (result.summary as string) || `Based on your profile as a ${data.jobDescription.replace('-', ' ')} with ${data.experience} in ${data.industry}, your role has a ${(result.riskLevel as string)?.toLowerCase() || 'medium'} risk of AI displacement.`,
      factors: {
        automation: (result.factors as Record<string, number>)?.automation || 50,
        aiReplacement: (result.factors as Record<string, number>)?.aiReplacement || (result.riskScore as number) || 50,
        skillDemand: (result.factors as Record<string, number>)?.skillDemand || (100 - ((result.riskScore as number) || 50)),
        industryGrowth: (result.factors as Record<string, number>)?.industryGrowth || 50
      },
      recommendations: (result.recommendations as string[]) || [
        'Develop AI collaboration skills',
        'Focus on creative and strategic thinking',
        'Learn emerging technologies in your field',
        'Build strong interpersonal relationships',
        'Consider upskilling in complementary areas'
      ],
      keyFindings: (result.keyFindings as string[]) || [],
      sources: (result.sources as string[]) || [],
      lastUpdated: (result.lastUpdated as string) || new Date().toISOString()
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