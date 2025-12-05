import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockService, Stock } from '@/services/stockService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export default function PortfolioPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [sectorData, setSectorData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    const items = await StockService.getAll();
    setStocks(items);

    const total = items.reduce((sum, stock) => sum + (stock.currentPrice || 0) * 100, 0);
    setTotalValue(total);
    setTotalGain(total * 0.12);

    const sectors = items.reduce((acc, stock) => {
      const industry = stock.industry || 'Other';
      if (!acc[industry]) {
        acc[industry] = 0;
      }
      acc[industry] += (stock.currentPrice || 0) * 100;
      return acc;
    }, {} as Record<string, number>);

    const sectorArray = Object.entries(sectors).map(([name, value]) => ({ name, value }));
    setSectorData(sectorArray);
  };

  const COLORS = ['#64FFDA', '#BB86FC', '#FF4081', '#64FFDA80', '#BB86FC80', '#FF408180'];

  const performanceData = [
    { month: 'Jan', value: 85000 },
    { month: 'Feb', value: 92000 },
    { month: 'Mar', value: 88000 },
    { month: 'Apr', value: 95000 },
    { month: 'May', value: 102000 },
    { month: 'Jun', value: totalValue },
  ];

  const topPerformers = stocks
    .filter((s) => s.roe !== undefined)
    .sort((a, b) => (b.roe || 0) - (a.roe || 0))
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-[120rem] mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Portfolio <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-lg font-paragraph text-foreground/70">
              Track your holdings, performance, and sector allocation
            </p>
          </motion.div>

          {/* Portfolio Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Live</Badge>
              </div>
              <div className="text-sm font-paragraph text-foreground/60 mb-2">
                Total Portfolio Value
              </div>
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                {formatCurrency(totalValue)}
              </div>
              <div className="flex items-center gap-2 text-sm font-paragraph text-primary">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5% overall</span>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30">+12.5%</Badge>
              </div>
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Total Gains</div>
              <div className="text-4xl font-heading font-bold text-secondary mb-2">
                {formatCurrency(totalGain)}
              </div>
              <div className="flex items-center gap-2 text-sm font-paragraph text-secondary">
                <Activity className="h-4 w-4" />
                <span>This month: +₹8,500</span>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-data-highlight/10 to-data-highlight/5 border-data-highlight/30 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-data-highlight/20 border border-data-highlight/30 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-data-highlight" />
                </div>
                <Badge className="bg-data-highlight/20 text-data-highlight border-data-highlight/30">
                  {stocks.length} stocks
                </Badge>
              </div>
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Holdings</div>
              <div className="text-4xl font-heading font-bold text-data-highlight mb-2">
                {stocks.length}
              </div>
              <div className="flex items-center gap-2 text-sm font-paragraph text-data-highlight">
                <PieChartIcon className="h-4 w-4" />
                <span>{sectorData.length} sectors</span>
              </div>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Sector Allocation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-lg h-full">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
                  <PieChartIcon className="h-6 w-6 text-primary" />
                  Sector Allocation
                </h2>
                {sectorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-foreground/50">
                    No data available
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-lg h-full">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
                  <Activity className="h-6 w-6 text-secondary" />
                  Performance Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#BB86FC"
                      strokeWidth={3}
                      dot={{ fill: '#BB86FC', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-lg">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                Top Performers by ROE
              </h2>
              <div className="space-y-4">
                {topPerformers.map((stock, index) => (
                  <div
                    key={stock._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-foreground">
                          {stock.stockName}
                        </div>
                        <div className="text-sm font-mono text-foreground/60">
                          {stock.tickerSymbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-paragraph text-foreground">
                          ₹{stock.currentPrice?.toFixed(2)}
                        </div>
                        <div className="text-sm text-foreground/60">{stock.industry}</div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        ROE: {stock.roe?.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <div className="text-center py-8 text-foreground/50">
                    No performance data available
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
