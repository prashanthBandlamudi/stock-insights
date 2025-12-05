// HPI 1.6-V
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { 
  TrendingUp, 
  Database, 
  Activity, 
  Wallet, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  Zap, 
  Globe, 
  Layers, 
  Search, 
  Lock 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { FundamentalScreeningResults } from '@/entities';

// --- Types ---
type FeatureItem = {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  color: 'primary' | 'secondary' | 'data-highlight';
  colSpan?: string;
};

// --- Mandatory Animated Component Pattern ---
type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Add a small delay via setTimeout if needed, or just let CSS handle transition-delay
        setTimeout(() => {
            element.classList.add('is-visible');
        }, delay);
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className={`reveal-on-scroll ${className || ''}`}>{children}</div>;
};

// --- Helper Components ---

const NeonGridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#333333_1px,transparent_1px),linear-gradient(to_bottom,#333333_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30 blur-3xl" />
  </div>
);

const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-primary opacity-0 group-hover:opacity-70 animate-pulse translate-x-[2px]">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-secondary opacity-0 group-hover:opacity-70 animate-pulse -translate-x-[2px]">
        {text}
      </span>
    </div>
  );
};

export default function HomePage() {
  // --- Data Fidelity Protocol: Canonical Data Sources ---
  const [stockCount, setStockCount] = useState(0);
  
  // Preserved Tickers List
  const tickers = [
    'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI', 'SBIN', 'BHARTI', 'ITC',
    'KOTAKBANK', 'LT', 'HCLTECH', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'SUNPHARMA',
    'TITAN', 'BAJFINANCE', 'ULTRACEMCO', 'NESTLEIND', 'WIPRO'
  ];

  // Preserved Features Data Structure (Enhanced for Layout)
  const features: FeatureItem[] = [
    {
      icon: Database,
      title: 'Fundamental Screening',
      description: 'Import and analyze screening results from Screener.in with comprehensive fundamental metrics.',
      link: '/fundamentals',
      color: 'primary',
      colSpan: 'md:col-span-2 lg:col-span-8'
    },
    {
      icon: Activity,
      title: 'Technical Indicators',
      description: 'Apply RSI, MACD, Bollinger Bands and more to identify trading opportunities.',
      link: '/fundamentals',
      color: 'secondary',
      colSpan: 'md:col-span-1 lg:col-span-4'
    },
    {
      icon: Wallet,
      title: 'Portfolio Tracking',
      description: 'Monitor your holdings, positions, and performance with real-time updates.',
      link: '/portfolio',
      color: 'data-highlight',
      colSpan: 'md:col-span-1 lg:col-span-4'
    },
    {
      icon: BarChart3,
      title: 'Interactive Charts',
      description: 'Visualize sector allocation, P&L trends, and market movements.',
      link: '/portfolio',
      color: 'primary',
      colSpan: 'md:col-span-2 lg:col-span-8'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track returns, analyze trends, and optimize your investment strategy.',
      link: '/portfolio',
      color: 'secondary',
      colSpan: 'md:col-span-1 lg:col-span-6'
    },
    {
      icon: Layers,
      title: 'Data Management',
      description: 'Seamlessly import, export, and manage your stock screening data.',
      link: '/fundamentals',
      color: 'data-highlight',
      colSpan: 'md:col-span-1 lg:col-span-6'
    },
  ];

  useEffect(() => {
    const loadStats = async () => {
      const { items } = await BaseCrudService.getAll<FundamentalScreeningResults>('fundamentalscreeningresults');
      setStockCount(items.length);
    };
    loadStats();
  }, []);

  // --- Scroll & Motion Hooks ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-paragraph selection:bg-primary/30 selection:text-primary overflow-x-clip">
      {/* Custom Styles for Scoped Effects */}
      <style>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .neon-border-hover:hover {
          border-color: rgba(100, 255, 218, 0.5);
          box-shadow: 0 0 20px rgba(100, 255, 218, 0.1);
        }
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
        .clip-diagonal {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .clip-diagonal-reverse {
          clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%);
        }
      `}</style>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      <Header />

      <main className="relative w-full">
        
        {/* --- HERO SECTION: The Interactive Data Stream --- */}
        <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-20">
          <NeonGridBackground />
          
          {/* Animated Ticker Background (Parallax Layer) */}
          <div className="absolute inset-0 z-0 flex flex-col justify-between opacity-20 pointer-events-none select-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="flex whitespace-nowrap text-xs font-mono text-primary/40"
                animate={{ x: i % 2 === 0 ? [-1000, 0] : [0, -1000] }}
                transition={{ duration: 40 + i * 5, repeat: Infinity, ease: "linear" }}
              >
                {[...tickers, ...tickers, ...tickers].map((t, idx) => (
                  <span key={`${i}-${idx}`} className="mx-8">{t} // {Math.floor(Math.random() * 1000)}.{Math.floor(Math.random() * 99)}</span>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-[100rem] mx-auto px-6 text-center">
            <AnimatedElement>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                SYSTEM ONLINE // V.2.0.4
              </div>
            </AnimatedElement>

            <AnimatedElement delay={100}>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold tracking-tighter leading-[0.9] mb-8 text-white">
                UNLOCK YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                  PORTFOLIO
                </span>
              </h1>
            </AnimatedElement>

            <AnimatedElement delay={200}>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Advanced stock analysis with <span className="text-primary">fundamental screening</span>, technical indicators, and real-time portfolio tracking.
              </p>
            </AnimatedElement>

            <AnimatedElement delay={300}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/fundamentals">
                  <Button className="h-14 px-10 bg-primary text-black hover:bg-primary/90 text-lg font-bold rounded-none clip-path-button relative overflow-hidden group">
                    <span className="relative z-10 flex items-center gap-2">
                      INITIATE ANALYSIS <ArrowRight className="w-5 h-5" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/portfolio">
                  <Button variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/5 text-lg font-mono rounded-none">
                    // TRACK_PORTFOLIO
                  </Button>
                </Link>
              </div>
            </AnimatedElement>
          </div>

          {/* Hero Footer Decoration */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent z-20" />
        </section>


        {/* --- SECTION 2: The Algorithm (Process) --- */}
        <section className="relative py-32 w-full overflow-hidden">
          <div className="max-w-[120rem] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left: Text Content */}
              <div className="lg:col-span-5 space-y-12">
                <AnimatedElement>
                  <h2 className="text-5xl md:text-6xl font-heading font-bold leading-tight">
                    PRECISION <br />
                    <span className="text-stroke">ENGINEERING</span>
                  </h2>
                </AnimatedElement>
                
                <div className="space-y-8">
                  {[
                    { title: '01. IMPORT', desc: 'Seamlessly ingest CSV data from Screener.in.' },
                    { title: '02. ANALYZE', desc: 'Apply advanced technical indicators automatically.' },
                    { title: '03. EXECUTE', desc: 'Make data-driven decisions with real-time insights.' }
                  ].map((step, idx) => (
                    <AnimatedElement key={idx} delay={idx * 100}>
                      <div className="flex gap-6 group cursor-default">
                        <div className="font-mono text-primary/50 text-xl pt-1 group-hover:text-primary transition-colors">
                          {step.title}
                        </div>
                        <div className="border-l border-white/10 pl-6 group-hover:border-primary/50 transition-colors">
                          <p className="text-gray-400 group-hover:text-white transition-colors">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>

              {/* Right: Visual Abstract Representation */}
              <div className="lg:col-span-7 relative h-[600px]">
                <AnimatedElement className="w-full h-full">
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                    <Image 
                      src="https://static.wixstatic.com/media/8dac79_74bee848785243348316ba10b892daa7~mv2.png?originWidth=1024&originHeight=576"
                      alt="Abstract data visualization of stock market trends"
                      className="w-full h-full object-cover opacity-60 mix-blend-screen hover:scale-105 transition-transform duration-1000"
                    />
                    {/* Overlay UI Elements */}
                    <div className="absolute top-8 right-8 p-4 bg-black/80 border border-primary/30 backdrop-blur-md rounded-lg">
                      <div className="text-xs font-mono text-primary mb-1">PROCESSING POWER</div>
                      <div className="text-2xl font-bold text-white">98.4%</div>
                    </div>
                    <div className="absolute bottom-8 left-8 p-6 bg-black/80 border border-white/10 backdrop-blur-md rounded-lg max-w-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-gray-400">LIVE FEED</span>
                      </div>
                      <div className="text-sm text-gray-300 font-mono">
                        Analyzing {stockCount > 0 ? stockCount : '...'} data points for optimal entry signals.
                      </div>
                    </div>
                  </div>
                </AnimatedElement>
              </div>
            </div>
          </div>
        </section>


        {/* --- SECTION 3: Core Modules (Asymmetrical Grid) --- */}
        <section className="relative py-32 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-[120rem] mx-auto px-6">
            <AnimatedElement className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                  CORE <span className="text-primary">MODULES</span>
                </h2>
                <p className="text-gray-400 max-w-xl">
                  A comprehensive suite of tools designed for the modern investor.
                </p>
              </div>
              <div className="hidden md:block h-px flex-1 bg-white/10 mx-8 mb-4" />
              <div className="font-mono text-sm text-gray-500 mb-2">
                // SELECT_MODULE
              </div>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
              {features.map((feature, index) => (
                <div key={index} className={`${feature.colSpan} group`}>
                  <AnimatedElement delay={index * 50} className="h-full">
                    <Link to={feature.link} className="block h-full">
                      <div className="relative h-full p-8 glass-panel rounded-xl transition-all duration-300 hover:bg-white/[0.05] neon-border-hover overflow-hidden">
                        {/* Hover Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div className="mb-8">
                            <div className={`w-12 h-12 rounded-lg bg-${feature.color}/20 flex items-center justify-center mb-6 text-${feature.color}`}>
                              <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-white transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                              {feature.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                            <span className={`text-xs font-mono text-${feature.color}`}>
                              ACCESS_MODULE
                            </span>
                            <ArrowRight className={`w-4 h-4 text-${feature.color} transform group-hover:translate-x-1 transition-transform`} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedElement>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* --- SECTION 4: Visual Breather (Parallax) --- */}
        <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center clip-diagonal my-12">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://static.wixstatic.com/media/8dac79_44a6850b3d7f4316a4326b96825861ba~mv2.png?originWidth=1280&originHeight=704"
              alt="Futuristic market data visualization background"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
          </div>
          
          <div className="relative z-10 text-center max-w-4xl px-6">
            <AnimatedElement>
              <Cpu className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
              <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8 leading-tight">
                "DATA IS THE NEW <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-data-highlight">
                  CURRENCY
                </span>"
              </h2>
              <p className="text-xl font-mono text-gray-400">
                HARNESS THE FLOW. PREDICT THE OUTCOME.
              </p>
            </AnimatedElement>
          </div>
        </section>


        {/* --- SECTION 5: System Metrics (Stats) --- */}
        <section className="py-32 px-6 relative">
          <div className="max-w-[100rem] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
              {[
                { label: 'STOCKS ANALYZED', value: stockCount, suffix: '+', icon: Search },
                { label: 'INDICATORS ACTIVE', value: '12', suffix: '', icon: Activity },
                { label: 'SYSTEM UPTIME', value: '99.9', suffix: '%', icon: Zap },
              ].map((stat, index) => (
                <div key={index} className="bg-background p-12 group hover:bg-white/[0.02] transition-colors relative">
                  <AnimatedElement delay={index * 100}>
                    <div className="flex justify-between items-start mb-8">
                      <stat.icon className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
                      <div className="text-xs font-mono text-gray-600">METRIC_0{index + 1}</div>
                    </div>
                    <div className="text-6xl md:text-7xl font-heading font-bold text-white mb-2 group-hover:scale-105 transition-transform origin-left">
                      {stat.value}<span className="text-primary text-4xl">{stat.suffix}</span>
                    </div>
                    <div className="text-sm font-mono text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </AnimatedElement>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* --- SECTION 6: Final CTA --- */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 clip-diagonal-reverse pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <AnimatedElement>
              <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8">
                READY TO <GlitchText text="DEPLOY" />?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Initialize your workspace and begin tracking your assets with institutional-grade precision.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/fundamentals">
                  <Button className="h-16 px-12 bg-white text-black hover:bg-gray-200 text-xl font-bold rounded-full transition-all hover:scale-105">
                    START SCREENING
                  </Button>
                </Link>
                <Link to="/portfolio">
                  <Button variant="ghost" className="h-16 px-12 text-white border border-white/20 hover:bg-white/10 text-xl font-mono rounded-full">
                    VIEW DEMO
                  </Button>
                </Link>
              </div>
            </AnimatedElement>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}