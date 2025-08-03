import { ReactNode } from 'react';

interface BusinessIdeaLayoutProps {
  children: ReactNode;
}

export default function BusinessIdeaLayout({ children }: BusinessIdeaLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
