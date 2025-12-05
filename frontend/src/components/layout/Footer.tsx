export default function Footer() {
  return (
    <footer className="border-t border-grid-line bg-background mt-auto">
      <div className="max-w-[120rem] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-paragraph text-foreground/60">
            © {new Date().getFullYear()} StockPulse. All rights reserved.
          </p>
          <p className="text-xs font-paragraph text-foreground/40">
            Market data and analysis for informed investment decisions
          </p>
        </div>
      </div>
    </footer>
  );
}
