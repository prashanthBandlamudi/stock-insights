import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, TrendingUp, TrendingDown, ArrowUpDown, FileText, X, Lock, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { FundamentalScreeningResults } from '@/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import SubscriptionModal from '@/components/SubscriptionModal';

export default function FundamentalsPage() {
  const { isSubscribed } = useSubscriptionStore();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [stocks, setStocks] = useState<FundamentalScreeningResults[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<FundamentalScreeningResults[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof FundamentalScreeningResults>('stockName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStock, setSelectedStock] = useState<FundamentalScreeningResults | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    stockName: '',
    tickerSymbol: '',
    marketCap: '',
    peRatio: '',
    roe: '',
    debtToEquity: '',
    currentPrice: '',
    industry: '',
  });

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    filterAndSortStocks();
  }, [stocks, searchQuery, sortField, sortDirection]);

  const loadStocks = async () => {
    const { items } = await BaseCrudService.getAll<FundamentalScreeningResults>('fundamentalscreeningresults');
    // If not subscribed, limit to 5 stocks
    const displayStocks = isSubscribed ? items : items.slice(0, 5);
    setStocks(displayStocks);
  };

  const filterAndSortStocks = () => {
    let filtered = [...stocks];

    if (searchQuery) {
      filtered = filtered.filter(
        (stock) =>
          stock.stockName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.tickerSymbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setFilteredStocks(filtered);
  };

  const handleSort = (field: keyof FundamentalScreeningResults) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddStock = async () => {
    await BaseCrudService.create('fundamentalscreeningresults', {
      _id: crypto.randomUUID(),
      stockName: formData.stockName,
      tickerSymbol: formData.tickerSymbol,
      marketCap: formData.marketCap ? parseFloat(formData.marketCap) : undefined,
      peRatio: formData.peRatio ? parseFloat(formData.peRatio) : undefined,
      roe: formData.roe ? parseFloat(formData.roe) : undefined,
      debtToEquity: formData.debtToEquity ? parseFloat(formData.debtToEquity) : undefined,
      currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
      industry: formData.industry,
      dataDate: new Date().toISOString(),
    });

    setFormData({
      stockName: '',
      tickerSymbol: '',
      marketCap: '',
      peRatio: '',
      roe: '',
      debtToEquity: '',
      currentPrice: '',
      industry: '',
    });
    setIsAddDialogOpen(false);
    loadStocks();
  };

  const handleDeleteStock = async (id: string) => {
    await BaseCrudService.delete('fundamentalscreeningresults', id);
    loadStocks();
    setSelectedStock(null);
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const formatMarketCap = (cap: number | undefined) => {
    if (cap === undefined) return 'N/A';
    if (cap >= 10000) return `₹${(cap / 1000).toFixed(2)}K Cr`;
    return `₹${cap.toFixed(2)} Cr`;
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
              Fundamental <span className="text-primary">Screening</span>
            </h1>
            <p className="text-lg font-paragraph text-foreground/70">
              Analyze stocks based on fundamental metrics and financial ratios
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <Input
                type="text"
                placeholder="Search stocks, tickers, or industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-foreground font-paragraph"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-paragraph"
              >
                <FileText className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
              <Button
                onClick={() => {
                  if (!isSubscribed) {
                    setIsSubscriptionModalOpen(true);
                  } else {
                    setIsImportDialogOpen(true);
                  }
                }}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 font-paragraph"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </div>
          </motion.div>

          {/* Subscription Notice */}
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-paragraph text-foreground font-semibold">Limited to 5 stocks</p>
                  <p className="text-sm font-paragraph text-foreground/70">Upgrade to view all {stocks.length > 5 ? stocks.length : 'unlimited'} stocks</p>
                </div>
              </div>
              <Button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-paragraph"
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total Stocks', value: filteredStocks.length, color: 'primary' },
              { label: 'Avg P/E Ratio', value: (filteredStocks.reduce((sum, s) => sum + (s.peRatio || 0), 0) / filteredStocks.length || 0).toFixed(2), color: 'secondary' },
              { label: 'Avg ROE', value: `${(filteredStocks.reduce((sum, s) => sum + (s.roe || 0), 0) / filteredStocks.length || 0).toFixed(2)}%`, color: 'data-highlight' },
              { label: 'Industries', value: new Set(filteredStocks.map(s => s.industry).filter(Boolean)).size, color: 'primary' },
            ].map((stat, index) => (
              <Card key={stat.label} className="p-6 bg-white/5 border-white/10 backdrop-blur-lg">
                <div className="text-sm font-paragraph text-foreground/60 mb-2">{stat.label}</div>
                <div className={`text-3xl font-heading font-bold text-${stat.color}`}>{stat.value}</div>
              </Card>
            ))}
          </motion.div>

          {/* Stocks Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {[
                      { key: 'stockName', label: 'Stock Name' },
                      { key: 'tickerSymbol', label: 'Ticker' },
                      { key: 'industry', label: 'Industry' },
                      { key: 'marketCap', label: 'Market Cap' },
                      { key: 'currentPrice', label: 'Price' },
                      { key: 'peRatio', label: 'P/E' },
                      { key: 'roe', label: 'ROE %' },
                      { key: 'debtToEquity', label: 'D/E' },
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground/80 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort(column.key as keyof FundamentalScreeningResults)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock, index) => (
                    <motion.tr
                      key={stock._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <td className="px-6 py-4 font-paragraph text-foreground font-semibold">
                        {stock.stockName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-paragraph text-primary">
                        {stock.tickerSymbol || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-paragraph text-foreground/70">
                        <Badge variant="outline" className="border-secondary/30 text-secondary">
                          {stock.industry || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-paragraph text-foreground/80">
                        {formatMarketCap(stock.marketCap)}
                      </td>
                      <td className="px-6 py-4 font-paragraph text-foreground/80">
                        ₹{formatNumber(stock.currentPrice)}
                      </td>
                      <td className="px-6 py-4 font-paragraph text-foreground/80">
                        {formatNumber(stock.peRatio)}
                      </td>
                      <td className="px-6 py-4 font-paragraph">
                        <div className="flex items-center gap-2">
                          {stock.roe !== undefined && stock.roe > 15 ? (
                            <TrendingUp className="h-4 w-4 text-primary" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-data-highlight" />
                          )}
                          <span className={stock.roe !== undefined && stock.roe > 15 ? 'text-primary' : 'text-data-highlight'}>
                            {formatNumber(stock.roe)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-paragraph text-foreground/80">
                        {formatNumber(stock.debtToEquity)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStocks.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg font-paragraph text-foreground/60">
                  No stocks found. Try adjusting your search or import data.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Stock Details Dialog */}
      <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
        <DialogContent className="bg-background border-white/10 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-bold text-foreground">
              {selectedStock?.stockName}
            </DialogTitle>
            <DialogDescription className="text-lg font-paragraph text-primary">
              {selectedStock?.tickerSymbol}
            </DialogDescription>
          </DialogHeader>

          {selectedStock && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">Industry</div>
                  <div className="text-xl font-heading font-bold text-foreground">
                    {selectedStock.industry || 'N/A'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">Market Cap</div>
                  <div className="text-xl font-heading font-bold text-primary">
                    {formatMarketCap(selectedStock.marketCap)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">Current Price</div>
                  <div className="text-xl font-heading font-bold text-foreground">
                    ₹{formatNumber(selectedStock.currentPrice)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">P/E Ratio</div>
                  <div className="text-xl font-heading font-bold text-foreground">
                    {formatNumber(selectedStock.peRatio)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">ROE</div>
                  <div className={`text-xl font-heading font-bold ${selectedStock.roe !== undefined && selectedStock.roe > 15 ? 'text-primary' : 'text-data-highlight'}`}>
                    {formatNumber(selectedStock.roe)}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-paragraph text-foreground/60 mb-1">Debt to Equity</div>
                  <div className="text-xl font-heading font-bold text-foreground">
                    {formatNumber(selectedStock.debtToEquity)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleDeleteStock(selectedStock._id)}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 font-paragraph"
                >
                  Delete Stock
                </Button>
                <Button
                  onClick={() => setSelectedStock(null)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-paragraph ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-background border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Add New Stock
            </DialogTitle>
            <DialogDescription className="font-paragraph text-foreground/70">
              Enter the fundamental data for the stock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockName" className="font-paragraph text-foreground/80">Stock Name</Label>
                <Input
                  id="stockName"
                  value={formData.stockName}
                  onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="tickerSymbol" className="font-paragraph text-foreground/80">Ticker Symbol</Label>
                <Input
                  id="tickerSymbol"
                  value={formData.tickerSymbol}
                  onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="industry" className="font-paragraph text-foreground/80">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="marketCap" className="font-paragraph text-foreground/80">Market Cap (Cr)</Label>
                <Input
                  id="marketCap"
                  type="number"
                  value={formData.marketCap}
                  onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="currentPrice" className="font-paragraph text-foreground/80">Current Price (₹)</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="peRatio" className="font-paragraph text-foreground/80">P/E Ratio</Label>
                <Input
                  id="peRatio"
                  type="number"
                  value={formData.peRatio}
                  onChange={(e) => setFormData({ ...formData, peRatio: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="roe" className="font-paragraph text-foreground/80">ROE (%)</Label>
                <Input
                  id="roe"
                  type="number"
                  value={formData.roe}
                  onChange={(e) => setFormData({ ...formData, roe: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
              <div>
                <Label htmlFor="debtToEquity" className="font-paragraph text-foreground/80">Debt to Equity</Label>
                <Input
                  id="debtToEquity"
                  type="number"
                  value={formData.debtToEquity}
                  onChange={(e) => setFormData({ ...formData, debtToEquity: e.target.value })}
                  className="bg-white/5 border-white/10 text-foreground font-paragraph"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                variant="outline"
                className="border-white/10 text-foreground hover:bg-white/5 font-paragraph"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStock}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-paragraph ml-auto"
                disabled={!formData.stockName || !formData.tickerSymbol}
              >
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Import CSV Data
            </DialogTitle>
            <DialogDescription className="font-paragraph text-foreground/70">
              Upload screening results from Screener.in
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="font-paragraph text-foreground/70 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm font-paragraph text-foreground/50">
                CSV files from Screener.in
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm font-paragraph text-foreground/70 mb-2">
                Expected CSV format:
              </p>
              <code className="text-xs font-paragraph text-primary">
                Stock Name, Ticker, Market Cap, P/E, ROE, D/E, Price, Industry
              </code>
            </div>

            <Button
              onClick={() => setIsImportDialogOpen(false)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-paragraph"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />

      <Footer />
    </div>
  );
}
