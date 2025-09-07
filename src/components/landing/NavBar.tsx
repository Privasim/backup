import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold text-primary">CareerGuard</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/research" className="text-secondary hover:text-brand font-medium transition-colors focus-ring">
            Research Data
          </Link>
          <Link href="/#features" className="link-primary font-medium focus-ring">
            Features
          </Link>
        </div>
      </div>
    </nav>
  );
}
