import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, TrendingUp, TrendingDown, ArrowUpDown, FileText, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockService, Stock } from '@/services/stockService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function FundamentalsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Stock>('stockName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
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
    const items = await StockService.getAll();
    setStocks(items);
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

  const handleSort = (field: keyof Stock) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddStock = async () => {
    await StockService.create({
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
    if (id) {
      await StockService.delete(id);
      loadStocks();
      setSelectedStock(null);
    }
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
            </div>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Total Stocks</div>
              <div className="text-3xl font-heading font-bold text-primary">{stocks.length}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Avg P/E Ratio</div>
              <div className="text-3xl font-heading font-bold text-secondary">
                {stocks.length > 0
                  ? (
                      stocks.reduce((sum, s) => sum + (s.peRatio || 0), 0) / stocks.length
                    ).toFixed(2)
                  : '0'}
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-data-highlight/10 to-data-highlight/5 border-data-highlight/30">
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Avg ROE</div>
              <div className="text-3xl font-heading font-bold text-data-highlight">
                {stocks.length > 0
                  ? (
                      stocks.reduce((sum, s) => sum + (s.roe || 0), 0) / stocks.length
                    ).toFixed(2)}%
                  : '0%'}
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <div className="text-sm font-paragraph text-foreground/60 mb-2">Industries</div>
              <div className="text-3xl font-heading font-bold text-primary">
                {new Set(stocks.map((s) => s.industry)).size}
              </div>
            </Card>
          </motion.div>

          {/* Stock Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-x-auto"
          >
            <Card className="p-6 bg-white/5 border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('stockName')}
                    >
                      <div className="flex items-center gap-2">
                        Stock Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('tickerSymbol')}
                    >
                      <div className="flex items-center gap-2">
                        Ticker
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('currentPrice')}
                    >
                      <div className="flex items-center gap-2">
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('marketCap')}
                    >
                      <div className="flex items-center gap-2">
                        Market Cap
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('peRatio')}
                    >
                      <div className="flex items-center gap-2">
                        P/E Ratio
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('roe')}
                    >
                      <div className="flex items-center gap-2">
                        ROE
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70">
                      Industry
                    </th>
                    <th className="text-left py-4 px-4 font-paragraph text-sm text-foreground/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <td className="py-4 px-4 font-paragraph text-foreground">
                        {stock.stockName}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-primary">
                        {stock.tickerSymbol}
                      </td>
                      <td className="py-4 px-4 font-paragraph text-foreground">
                        ₹{formatNumber(stock.currentPrice)}
                      </td>
                      <td className="py-4 px-4 font-paragraph text-foreground">
                        {formatMarketCap(stock.marketCap)}
                      </td>
                      <td className="py-4 px-4 font-paragraph text-foreground">
                        {formatNumber(stock.peRatio)}
                      </td>
                      <td className="py-4 px-4 font-paragraph">
                        <Badge
                          className={
                            (stock.roe || 0) > 15
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }
                        >
                          {formatNumber(stock.roe)}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-paragraph text-foreground/70">
                        {stock.industry || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (stock._id) handleDeleteStock(stock._id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStocks.length === 0 && (
                <div className="text-center py-12 text-foreground/50">
                  No stocks found. Add some stocks to get started.
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Add Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add New Stock</DialogTitle>
            <DialogDescription className="font-paragraph">
              Enter the details of the stock you want to add to your screening list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stockName">Stock Name</Label>
              <Input
                id="stockName"
                value={formData.stockName}
                onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
              <Input
                id="tickerSymbol"
                value={formData.tickerSymbol}
                onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentPrice">Current Price</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="marketCap">Market Cap (Cr)</Label>
                <Input
                  id="marketCap"
                  type="number"
                  value={formData.marketCap}
                  onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="peRatio">P/E Ratio</Label>
                <Input
                  id="peRatio"
                  type="number"
                  value={formData.peRatio}
                  onChange={(e) => setFormData({ ...formData, peRatio: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="roe">ROE (%)</Label>
                <Input
                  id="roe"
                  type="number"
                  value={formData.roe}
                  onChange={(e) => setFormData({ ...formData, roe: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="debtToEquity">Debt/Equity</Label>
                <Input
                  id="debtToEquity"
                  type="number"
                  value={formData.debtToEquity}
                  onChange={(e) => setFormData({ ...formData, debtToEquity: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStock} className="bg-primary text-black">
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Details Dialog */}
      <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
        <DialogContent className="bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{selectedStock?.stockName}</DialogTitle>
            <DialogDescription className="font-mono text-primary">
              {selectedStock?.tickerSymbol}
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Current Price</div>
                  <div className="text-lg font-bold text-foreground">
                    ₹{formatNumber(selectedStock.currentPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Market Cap</div>
                  <div className="text-lg font-bold text-foreground">
                    {formatMarketCap(selectedStock.marketCap)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60 mb-1">P/E Ratio</div>
                  <div className="text-lg font-bold text-foreground">
                    {formatNumber(selectedStock.peRatio)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60 mb-1">ROE</div>
                  <div className="text-lg font-bold text-foreground">
                    {formatNumber(selectedStock.roe)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Debt/Equity</div>
                  <div className="text-lg font-bold text-foreground">
                    {formatNumber(selectedStock.debtToEquity)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60 mb-1">Industry</div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedStock.industry || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
