import Link from 'next/link';

export default function Hero() {
  return (
    <div className="min-h-screen bg-hero">
      <div className="flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="badge-base badge-primary mb-8">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
            AI Impact Assessment Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            AI is Replacing Jobs Across Industries, 
            <span className="text-brand block">Is Yours Next?</span>
          </h1>
          <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Get personalized insights about AI&apos;s impact on your job role with our comprehensive assessment tool. Make informed career decisions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/businessidea/profile-settings?step=1" className="btn-primary btn-lg min-w-[200px] focus-ring">
              Start Assessment
            </Link>
            <Link href="/research" className="btn-secondary btn-lg min-w-[200px] focus-ring">
              Explore Research
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
