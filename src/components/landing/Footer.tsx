export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-16 border-t border-[var(--border-muted)]">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-primary font-semibold">CareerGuard</span>
        </div>
        <p className="text-secondary text-sm">© {new Date().getFullYear()} CareerGuard. All rights reserved.</p>
      </div>
    </footer>
  );
}
