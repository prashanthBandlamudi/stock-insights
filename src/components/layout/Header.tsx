import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Database, BarChart3, Wallet } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/fundamentals', label: 'Fundamentals', icon: Database },
    { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-grid-line bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[120rem] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              Stock<span className="text-primary">Pulse</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-paragraph text-sm transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
