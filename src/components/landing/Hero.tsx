'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load the modular job loss visualization to keep initial bundle lean
const JobLossViz = dynamic(() => import('../../modules/job-loss-viz/components/JobLossViz'), { ssr: false });

export default function Hero() {
  const router = useRouter();

  const handleQuizClick = () => {
    router.push('/businessidea/profile-settings?step=1');
  };

  return (
    <div className="min-h-screen bg-hero">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-primary">CareerGuard</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => router.push('/research')}
              className="text-secondary hover:text-brand font-medium transition-colors focus-ring"
            >
              Research Data
            </button>
            <button className="link-primary font-medium focus-ring">
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="badge-base badge-primary mb-8">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
            AI Impact Assessment Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            AI is Replacing Jobs Across Industries, 
            <span className="text-brand block">Is Yours Next?</span>
          </h1>
          
          <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Get personalized insights about AI's impact on your job role with our comprehensive assessment tool. Make informed career decisions today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleQuizClick}
              className="btn-primary btn-lg min-w-[200px] focus-ring"
            >
              Start Assessment
            </button>
            <button 
              onClick={() => router.push('/research')}
              className="btn-secondary btn-lg min-w-[200px] focus-ring"
            >
              Explore Research
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand mb-2">50K+</div>
              <div className="text-secondary">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand mb-2">95%</div>
              <div className="text-secondary">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand mb-2">24/7</div>
              <div className="text-secondary">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global AI Job Loss Visualization (modular) */}
      <div className="px-6">
        <JobLossViz />
      </div>

      {/* Features Preview */}
      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-base p-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 fill-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Detailed Analysis</h3>
              <p className="text-secondary">Comprehensive evaluation of your role's AI vulnerability across multiple factors.</p>
            </div>

            <div className="card-base p-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 fill-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Instant Results</h3>
              <p className="text-secondary">Get immediate insights and personalized recommendations for your career path.</p>
            </div>

            <div className="card-base p-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 fill-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Action Plan</h3>
              <p className="text-secondary">Receive tailored strategies to future-proof your career against AI disruption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}