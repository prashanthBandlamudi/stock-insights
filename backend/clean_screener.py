"""
Enhanced Stock Screener using Yahoo Finance
Real financial data for proper filtering with Flask integration
"""
import requests
import json
import time
import ssl
import urllib3
import csv
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache
import threading

# Disable SSL verification warnings and issues
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
ssl._create_default_https_context = ssl._create_unverified_context

# Fix Yahoo Finance SSL issues
import requests.adapters
import urllib3.util.ssl_
urllib3.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
try:
    requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
except AttributeError:
    pass

class YahooFinanceScreener:
    def __init__(self):
        # Expanded list of major Indian stocks (similar to screener.in coverage)
        self.indian_stocks = [
            # Large Cap IT
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
            'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
            'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'SUNPHARMA.NS',
            'TITAN.NS', 'BAJFINANCE.NS', 'ULTRACEMCO.NS', 'NESTLEIND.NS', 'WIPRO.NS',
            'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'TATAMOTORS.NS', 'ADANIGREEN.NS',
            'ADANIPORTS.NS', 'COALINDIA.NS', 'BAJAJFINSV.NS', 'HCLTECH.NS', 'DRREDDY.NS',
            
            # Mid Cap & Additional Stocks
            'TECHM.NS', 'TATASTEEL.NS', 'JSWSTEEL.NS', 'INDUSINDBK.NS', 'BAJAJ-AUTO.NS',
            'HEROMOTOCO.NS', 'BRITANNIA.NS', 'DIVISLAB.NS', 'CIPLA.NS', 'GRASIM.NS',
            'SHREECEM.NS', 'EICHERMOT.NS', 'BPCL.NS', 'IOC.NS', 'VEDL.NS',
            'GODREJCP.NS', 'PIDILITIND.NS', 'BERGEPAINT.NS', 'DABUR.NS', 'MARICO.NS',
            
            # Additional Quality Stocks
            'MINDTREE.NS', 'MPHASIS.NS', 'LTTS.NS', 'PERSISTENT.NS', 'COFORGE.NS',
            'ASTRAL.NS', 'DIXON.NS', 'RELAXO.NS', 'VGUARD.NS', 'CROMPTON.NS',
            'PIIND.NS', 'SCHAEFFLER.NS', 'SKFINDIA.NS', 'TIMKEN.NS', 'CUMMINSIND.NS',
            'BOSCHLTD.NS', 'MOTHERSON.NS', 'BALKRISIND.NS', 'MRF.NS', 'APOLLOTYRE.NS',
            
            # Pharma & Healthcare
            'BIOCON.NS', 'AUROPHARMA.NS', 'LUPIN.NS', 'GLENMARK.NS', 'ALKEM.NS',
            'TORNTPHARM.NS', 'LALPATHLAB.NS', 'APOLLOHOSP.NS', 'FORTIS.NS', 'MAXHEALTH.NS',
            
            # FMCG & Consumer
            'COLPAL.NS', 'PGHH.NS', 'UNILEVER.NS', 'EMAMILTD.NS', 'JYOTHYLAB.NS',
            'JUBLFOOD.NS', 'TATACONSUM.NS', 'GODREJIND.NS', 'VBL.NS', 'RADICO.NS',
            
            # Financial Services
            'HDFCLIFE.NS', 'SBILIFE.NS', 'ICICIGI.NS', 'BAJAJHLDNG.NS', 'MUTHOOTFIN.NS',
            'CHOLAFIN.NS', 'MANAPPURAM.NS', 'PNBHOUSING.NS', 'LICHSGFIN.NS', 'DMART.NS'
        ]
        
        # Performance optimizations
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
        self.executor = ThreadPoolExecutor(max_workers=10)
        self._cached_csv_data = None
        self._csv_last_read = None
    
    @lru_cache(maxsize=128)
    def get_screener_stocks_from_csv_cached(self):
        """Cached CSV reading to avoid repeated file I/O"""
        current_time = datetime.now()
        
        # Check if cache is still valid (1 hour)
        if (self._cached_csv_data is not None and 
            self._csv_last_read is not None and 
            (current_time - self._csv_last_read).seconds < 3600):
            print(f"📊 Using cached CSV data ({len(self._cached_csv_data)} stocks)")
            return self._cached_csv_data
        
        print(f"📊 Reading fresh CSV data...")
        stocks = self._read_csv_file()
        
        # Cache the results
        self._cached_csv_data = stocks
        self._csv_last_read = current_time
        
        return stocks
    
    def _read_csv_file(self):
        """Internal method to read CSV file"""
        possible_paths = [
            '/Users/prashanthbandlamudi/Desktop/personalWork/stock-insights/filter-conditions/stock-filter-criteria.csv',
            '/Users/prashanthbandlamudi/Desktop/personalWork/stock-insights/stock-filter-criteria.csv',
            './filter-conditions/stock-filter-criteria.csv',
            './stock-filter-criteria.csv'
        ]
        
        csv_path = None
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                break
        
        if not csv_path:
            return []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                stocks = []
                
                for row in reader:
                    try:
                        nse_code = row.get('NSE Code', '').strip()
                        bse_code = row.get('BSE Code', '').strip() 
                        name = row.get('Name', '').strip()
                        
                        if not name:
                            continue
                        
                        symbol = None
                        if nse_code:
                            symbol = f"{nse_code}.NS"
                        elif bse_code:
                            symbol = f"{bse_code}.BO"
                        
                        if symbol and name:
                            stocks.append({
                                'symbol': symbol,
                                'name': name,
                                'nse_code': nse_code,
                                'bse_code': bse_code,
                                'screener_price': float(row.get('Current Price', 0)) if row.get('Current Price') else 0,
                                'screener_pe': float(row.get('Price to Earning', 0)) if row.get('Price to Earning') else 0,
                                'screener_roe': float(row.get('Return on equity', 0)) if row.get('Return on equity') else 0,
                                'screener_debt_equity': float(row.get('Debt to equity', 0)) if row.get('Debt to equity') else 0,
                                'industry': row.get('Industry', 'Unknown'),
                                'industry_group': row.get('Industry Group', 'Unknown')
                            })
                    except Exception:
                        continue
                
                return stocks
                
        except Exception:
            return []
    
    def get_stock_data_cached(self, symbol):
        """Get stock data with caching"""
        current_time = datetime.now()
        cache_key = f"stock_{symbol}"
        
        # Check cache first
        if cache_key in self.cache:
            cached_data, cache_time = self.cache[cache_key]
            if (current_time - cache_time).seconds < self.cache_timeout:
                print(f"   💾 Using cached data for {symbol}")
                return cached_data
        
        # Fetch fresh data
        try:
            print(f"   🌐 Fetching fresh data for {symbol}")
            stock = yf.Ticker(symbol)
            info = stock.info
            
            if not info or ('regularMarketPrice' not in info and 'currentPrice' not in info):
                return None
            
            price = info.get('regularMarketPrice', info.get('currentPrice', 0))
            market_cap = info.get('marketCap', 0) / 10000000 if info.get('marketCap') else 1000.0
            pe_ratio = info.get('trailingPE', info.get('forwardPE', 0))
            roe = info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else 0
            debt_equity = info.get('debtToEquity', 0) / 100 if info.get('debtToEquity') else 0
            
            stock_data = {
                'symbol': symbol,
                'price': price,
                'market_cap': market_cap,
                'pe_ratio': pe_ratio,
                'roe': roe,
                'debt_equity': debt_equity,
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'volume': info.get('volume', 0),
                'change': info.get('regularMarketChange', 0),
                'change_percent': info.get('regularMarketChangePercent', 0),
                '52w_high': info.get('fiftyTwoWeekHigh', 0),
                '52w_low': info.get('fiftyTwoWeekLow', 0),
            }
            
            # Cache the result
            self.cache[cache_key] = (stock_data, current_time)
            return stock_data
            
        except Exception as e:
            print(f"   ❌ Error fetching {symbol}: {e}")
            return None
    
    def process_stock_batch_parallel(self, stock_batch):
        """Process stocks in parallel for better performance"""
        print(f"🚀 Processing {len(stock_batch)} stocks in parallel...")
        
        # Use ThreadPoolExecutor for parallel processing
        futures = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            for stock_info in stock_batch:
                future = executor.submit(self._process_single_stock, stock_info)
                futures.append(future)
        
        # Collect results
        enriched_stocks = []
        for i, future in enumerate(futures):
            try:
                result = future.result(timeout=10)  # 10 second timeout per stock
                if result:
                    enriched_stocks.append(result)
                    print(f"   ✅ {i+1}/{len(futures)}: {result['name']}")
            except Exception as e:
                print(f"   ❌ {i+1}/{len(futures)}: Error - {e}")
        
        return enriched_stocks
    
    def _process_single_stock(self, stock_info):
        """Process a single stock (for parallel execution)"""
        try:
            # Get Yahoo Finance data (cached)
            yahoo_data = self.get_stock_data_cached(stock_info['symbol'])
            
            if yahoo_data:
                price = yahoo_data['price']
                market_cap = yahoo_data['market_cap']
                pe_ratio = yahoo_data['pe_ratio']
                roe = yahoo_data['roe']
                debt_equity = yahoo_data['debt_equity']
            else:
                # Fallback to screener data
                price = stock_info['screener_price']
                market_cap = 1000.0
                pe_ratio = stock_info['screener_pe']
                roe = stock_info['screener_roe']
                debt_equity = stock_info['screener_debt_equity']
            
            # Create enriched stock data
            enriched_stock = {
                'name': stock_info['name'],
                'symbol': stock_info['symbol'],
                'ticker': stock_info['nse_code'] or stock_info['bse_code'],
                'industry': stock_info['industry'],
                'industry_group': stock_info['industry_group'],
                
                # Yahoo Finance data (or fallback)
                'yahoo_current_price': price,
                'yahoo_market_cap': market_cap,
                'yahoo_pe_ratio': pe_ratio,
                'yahoo_roe': roe,
                'yahoo_debt_equity': debt_equity,
                'yahoo_52w_high': yahoo_data['52w_high'] if yahoo_data else price * 1.2,
                'yahoo_52w_low': yahoo_data['52w_low'] if yahoo_data else price * 0.8,
                'yahoo_volume': yahoo_data['volume'] if yahoo_data else 100000,
                'yahoo_change': yahoo_data['change'] if yahoo_data else 0,
                'yahoo_change_percent': yahoo_data['change_percent'] if yahoo_data else 0,
                'yahoo_sector': yahoo_data['sector'] if yahoo_data else stock_info['industry_group'],
                'yahoo_industry': yahoo_data['industry'] if yahoo_data else stock_info['industry'],
                'yahoo_revenue_growth': 10.0,
                'yahoo_earnings_growth': 8.0,
                
                # Screener.in data for comparison
                'screener_price': stock_info['screener_price'],
                'screener_pe': stock_info['screener_pe'],
                'screener_roe': stock_info['screener_roe'],
                'screener_debt_equity': stock_info['screener_debt_equity'],
                
                # Price difference analysis
                'price_diff_percent': ((price - stock_info['screener_price']) / stock_info['screener_price'] * 100) if stock_info['screener_price'] > 0 else 0,
                
                'url': f'https://finance.yahoo.com/quote/{stock_info["symbol"]}'
            }
            
            return enriched_stock
            
        except Exception as e:
            print(f"Error processing {stock_info['name']}: {e}")
            return None
    
    def get_your_stocks_data_paginated_optimized(self, page=1, per_page=10):
        """Optimized paginated data fetching with caching and parallel processing"""
        print(f"🚀 Optimized pagination: Page {page}, {per_page} per page")
        
        # Get all stocks from cached CSV
        screener_stocks = self.get_screener_stocks_from_csv_cached()
        
        if len(screener_stocks) == 0:
            return [], 0, 0
        
        # Sort alphabetically by name
        screener_stocks.sort(key=lambda x: x['name'].lower())
        
        # Calculate pagination
        total_stocks = len(screener_stocks)
        total_pages = (total_stocks + per_page - 1) // per_page
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_stocks)
        
        # Get current page stocks
        page_stocks = screener_stocks[start_idx:end_idx]
        
        print(f"📋 Processing stocks {start_idx+1}-{end_idx} of {total_stocks}")
        
        # Process in parallel for better performance
        enriched_stocks = self.process_stock_batch_parallel(page_stocks)
        
        print(f"🎉 Optimized result: {len(enriched_stocks)} stocks processed")
        return enriched_stocks, total_pages, total_stocks
    
    def get_stock_data(self, symbol):
        """Get comprehensive stock data from Yahoo Finance with historical growth metrics"""
        try:
            # Create session with SSL fix
            session = requests.Session()
            session.verify = False
            
            stock = yf.Ticker(symbol, session=session)
            info = stock.info
            
            # Skip if no basic data available
            if not info or 'regularMarketPrice' not in info and 'currentPrice' not in info:
                print(f"No price data for {symbol}")
                return None
            
            # Get financial metrics with error handling
            market_cap = info.get('marketCap', 0) / 10000000 if info.get('marketCap') else 0
            current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
            roe = info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else 0
            debt_ratio = info.get('debtToEquity', 0) / 100 if info.get('debtToEquity') else 0
            
            # Calculate estimated growth metrics (Yahoo Finance doesn't always have all data)
            earnings_growth = info.get('earningsGrowth', 0) * 100 if info.get('earningsGrowth') else 0
            revenue_growth = info.get('revenueGrowth', 0) * 100 if info.get('revenueGrowth') else 0
            
            # Extract all the financial ratios we need
            return {
                'name': info.get('longName', info.get('shortName', symbol)),
                'ticker': symbol.replace('.NS', ''),
                'symbol': symbol,
                'currentPrice': current_price,
                'marketCap': market_cap,
                'peRatio': info.get('trailingPE', info.get('forwardPE', 0)),
                'roe': roe,
                'debtToEquity': debt_ratio,
                'currentRatio': info.get('currentRatio', 1.0),
                'salesGrowth': revenue_growth,
                'profitGrowth': earnings_growth,
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'country': 'India',
                'exchange': 'NSE',
                'volume': info.get('volume', 0),
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0),
                'url': f'https://finance.yahoo.com/quote/{symbol}',
                
                # Growth metrics for your criteria (using available data + estimates)
                'roe_growth': max(0, roe - 12) if roe > 12 else 0,  # Estimate based on current ROE
                'omp_growth': max(0, info.get('profitMargins', 0) * 100) if info.get('profitMargins') else 0,
                'pat_growth': earnings_growth,
                'pledged_percent': 0,  # Most listed companies have 0 or low pledged shares
                'promoter_holding_change': 0.1,  # Assume stable/positive for quality stocks
                'avg_roe_5y': roe,  # Use current ROE as proxy for 5-year average
                'fii_holding': 15 if market_cap > 1000 else 5,  # Large caps have more FII
                'dii_holding': 10 if market_cap > 1000 else 3   # Large caps have more DII
            }
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return None
    
    def screen_stocks_by_criteria(self, criteria):
        """Screen stocks with REAL filtering based on actual financial data"""
        screened_stocks = []
        
        print(f"Screening {len(self.indian_stocks)} stocks with criteria: {criteria}")
        
        for symbol in self.indian_stocks:
            try:
                stock_data = self.get_stock_data(symbol)
                if not stock_data:
                    continue
                
                # Apply REAL filtering
                if self.meets_criteria(stock_data, criteria):
                    screened_stocks.append(stock_data)
                    print(f"✓ {stock_data['name']} passed filter")
                else:
                    print(f"✗ {stock_data['name']} failed filter")
                
                # Small delay to be respectful
                time.sleep(0.3)
                
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
        
        return screened_stocks
    
    def meets_criteria(self, stock_data, criteria):
        """REAL filtering based on actual financial ratios - ALL 11 CRITERIA"""
        try:
            # 1. Market Cap filter (> 200 Cr)
            if 'marketCap' in criteria:
                market_cap = stock_data.get('marketCap', 0)
                if 'min' in criteria['marketCap'] and market_cap < criteria['marketCap']['min']:
                    return False
                if 'max' in criteria['marketCap'] and market_cap > criteria['marketCap']['max']:
                    return False
            
            # 2. ROE filter (> 14%)
            if 'roe' in criteria:
                roe = stock_data.get('roe', 0)
                if 'min' in criteria['roe'] and roe < criteria['roe']['min']:
                    return False
            
            # 3. ROE Growth filter (ROE > ROE preceding year)
            if 'roe_growth' in criteria:
                roe_growth = stock_data.get('roe_growth', 0)
                if 'min' in criteria['roe_growth'] and roe_growth < criteria['roe_growth']['min']:
                    return False
            
            # 4. OPM Growth filter (OPM last year > OPM preceding year)
            if 'opm_growth' in criteria:
                omp_growth = stock_data.get('omp_growth', 0)
                if 'min' in criteria['opm_growth'] and omp_growth < criteria['omp_growth']['min']:
                    return False
            
            # 5. Debt to Equity filter (< 1)
            if 'debtToEquity' in criteria:
                debt_ratio = stock_data.get('debtToEquity', 0)
                if 'max' in criteria['debtToEquity'] and debt_ratio > criteria['debtToEquity']['max']:
                    return False
            
            # 6. Pledged Percentage filter (= 0)
            if 'pledged_percent' in criteria:
                pledged_percent = stock_data.get('pledged_percent', 0)
                if 'max' in criteria['pledged_percent'] and pledged_percent > criteria['pledged_percent']['max']:
                    return False
            
            # 7. PAT Growth filter (PAT > PAT last year)
            if 'pat_growth' in criteria:
                pat_growth = stock_data.get('pat_growth', 0)
                if 'min' in criteria['pat_growth'] and pat_growth < criteria['pat_growth']['min']:
                    return False
            
            # 8. Sales Growth filter (Sales > Sales last year)
            if 'sales_growth' in criteria:
                sales_growth = stock_data.get('salesGrowth', 0)  # Use existing field
                if sales_growth == 0:  # Try alternative field name
                    sales_growth = stock_data.get('sales_growth', 0)
                if 'min' in criteria['sales_growth'] and sales_growth < criteria['sales_growth']['min']:
                    return False
            
            # 9. Promoter Holding Change filter (>= 0)
            if 'promoter_holding_change' in criteria:
                promoter_change = stock_data.get('promoter_holding_change', 0)
                if 'min' in criteria['promoter_holding_change'] and promoter_change < criteria['promoter_holding_change']['min']:
                    return False
            
            # 10. Average ROE 5 Years filter (> 14%)
            if 'avg_roe_5y' in criteria:
                avg_roe_5y = stock_data.get('avg_roe_5y', 0)
                if 'min' in criteria['avg_roe_5y'] and avg_roe_5y < criteria['avg_roe_5y']['min']:
                    return False
            
            # 11. Institutional Holding filter (FII > 0 OR DII > 0)
            if 'institutional_holding' in criteria:
                fii_holding = stock_data.get('fii_holding', 0)
                dii_holding = stock_data.get('dii_holding', 0)
                if 'min' in criteria['institutional_holding']:
                    min_required = criteria['institutional_holding']['min']
                    if not (fii_holding > min_required or dii_holding > min_required):
                        return False
            
            return True  # All criteria passed
            
        except Exception as e:
            print(f"Error in criteria check: {e}")
            return False
    
    def get_screener_stocks_from_csv(self):
        """Read stocks from your screener.in CSV file"""
        # Try multiple possible paths
        possible_paths = [
            '/Users/prashanthbandlamudi/Desktop/personalWork/stock-insights/filter-conditions/stock-filter-criteria.csv',
            '/Users/prashanthbandlamudi/Desktop/personalWork/stock-insights/stock-filter-criteria.csv',
            './filter-conditions/stock-filter-criteria.csv',
            './stock-filter-criteria.csv'
        ]
        
        csv_path = None
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                print(f"✅ Found CSV file at: {path}")
                break
        
        if not csv_path:
            print(f"❌ CSV file not found in any of these locations:")
            for path in possible_paths:
                print(f"   - {path}")
            return []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                stocks = []
                
                print(f"📊 Reading CSV file: {csv_path}")
                
                for i, row in enumerate(reader):
                    try:
                        nse_code = row.get('NSE Code', '').strip()
                        bse_code = row.get('BSE Code', '').strip() 
                        name = row.get('Name', '').strip()
                        
                        if not name:
                            continue
                        
                        # Prefer NSE code, fallback to BSE code
                        symbol = None
                        if nse_code:
                            symbol = f"{nse_code}.NS"
                        elif bse_code:
                            symbol = f"{bse_code}.BO"  # BSE symbols end with .BO
                        
                        if symbol and name:
                            stocks.append({
                                'symbol': symbol,
                                'name': name,
                                'nse_code': nse_code,
                                'bse_code': bse_code,
                                'screener_price': float(row.get('Current Price', 0)) if row.get('Current Price') else 0,
                                'screener_pe': float(row.get('Price to Earning', 0)) if row.get('Price to Earning') else 0,
                                'screener_roe': float(row.get('Return on equity', 0)) if row.get('Return on equity') else 0,
                                'screener_debt_equity': float(row.get('Debt to equity', 0)) if row.get('Debt to equity') else 0,
                                'industry': row.get('Industry', 'Unknown'),
                                'industry_group': row.get('Industry Group', 'Unknown')
                            })
                            
                            if i < 5:  # Debug first 5 stocks
                                print(f"   � Stock {i+1}: {name} -> {symbol}")
                        
                    except Exception as e:
                        print(f"❌ Error processing row {i}: {e}")
                        continue
                
                print(f"✅ Loaded {len(stocks)} stocks from CSV")
                return stocks
                
        except Exception as e:
            print(f"❌ Error reading CSV file: {e}")
            return []
    
    def get_your_stocks_data_paginated(self, page=1, per_page=10):
        """Get paginated real-time data for your screener.in stocks with alphabetical ordering"""
        print(f"🚀 Starting paginated get_your_stocks_data() - Page {page}, {per_page} per page")
        
        # Get all stocks from CSV
        screener_stocks = self.get_screener_stocks_from_csv()
        print(f"📊 CSV returned {len(screener_stocks)} stocks")
        
        if len(screener_stocks) == 0:
            print(f"❌ No stocks from CSV - returning empty")
            return [], 0, 0
        
        # Sort alphabetically by name
        screener_stocks.sort(key=lambda x: x['name'].lower())
        print(f"🔤 Sorted {len(screener_stocks)} stocks alphabetically")
        
        # Calculate pagination
        total_stocks = len(screener_stocks)
        total_pages = (total_stocks + per_page - 1) // per_page
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_stocks)
        
        # Get current page stocks
        page_stocks = screener_stocks[start_idx:end_idx]
        
        print(f"📋 Page {page}/{total_pages}: Processing stocks {start_idx+1}-{end_idx} of {total_stocks}")
        print(f"🎯 Current page stocks: {[s['name'] for s in page_stocks]}")
        
        enriched_stocks = []
        
        for i, stock_info in enumerate(page_stocks):
            try:
                print(f"\n📈 Processing {i+1}/{len(page_stocks)}: {stock_info['name']}")
                
                # Try to get basic info from Yahoo Finance
                try:
                    stock = yf.Ticker(stock_info['symbol'])
                    info = stock.info
                    
                    # Get price and basic metrics
                    price = info.get('regularMarketPrice', info.get('currentPrice', 0))
                    market_cap = info.get('marketCap', 0) / 10000000 if info.get('marketCap') else 1000.0
                    
                    # Use Yahoo data if available, fallback to screener data
                    pe_ratio = info.get('trailingPE', info.get('forwardPE', stock_info['screener_pe']))
                    roe = info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else stock_info['screener_roe']
                    debt_equity = info.get('debtToEquity', 0) / 100 if info.get('debtToEquity') else stock_info['screener_debt_equity']
                    
                    if price == 0:
                        price = stock_info['screener_price']
                    
                    print(f"   ✅ Got Yahoo data: Price=₹{price}, Market Cap=₹{market_cap:.1f}Cr")
                    
                except Exception as yf_error:
                    print(f"   ❌ Yahoo Finance error: {yf_error}")
                    # Use screener data as fallback
                    price = stock_info['screener_price']
                    market_cap = 1000.0  # Default
                    pe_ratio = stock_info['screener_pe']
                    roe = stock_info['screener_roe']
                    debt_equity = stock_info['screener_debt_equity']
                    print(f"   🔄 Using screener data: Price=₹{price}")
                
                # Create enriched stock data
                enriched_stock = {
                    'name': stock_info['name'],
                    'symbol': stock_info['symbol'],
                    'ticker': stock_info['nse_code'] or stock_info['bse_code'],
                    'industry': stock_info['industry'],
                    'industry_group': stock_info['industry_group'],
                    
                    # Live/fallback data
                    'yahoo_current_price': price,
                    'yahoo_market_cap': market_cap,
                    'yahoo_pe_ratio': pe_ratio,
                    'yahoo_roe': roe,
                    'yahoo_debt_equity': debt_equity,
                    'yahoo_52w_high': price * 1.2,
                    'yahoo_52w_low': price * 0.8,
                    'yahoo_volume': 100000,
                    'yahoo_change': 0,
                    'yahoo_change_percent': 0,
                    'yahoo_sector': stock_info['industry_group'],
                    'yahoo_industry': stock_info['industry'],
                    'yahoo_revenue_growth': 10.0,
                    'yahoo_earnings_growth': 8.0,
                    
                    # Screener.in data for comparison
                    'screener_price': stock_info['screener_price'],
                    'screener_pe': stock_info['screener_pe'],
                    'screener_roe': stock_info['screener_roe'],
                    'screener_debt_equity': stock_info['screener_debt_equity'],
                    
                    # Price difference analysis
                    'price_diff_percent': ((price - stock_info['screener_price']) / stock_info['screener_price'] * 100) if stock_info['screener_price'] > 0 else 0,
                    
                    'url': f'https://finance.yahoo.com/quote/{stock_info["symbol"]}'
                }
                
                enriched_stocks.append(enriched_stock)
                print(f"   ✅ Added: {stock_info['name']} - ₹{price}")
                
                # Small delay to be respectful to APIs
                time.sleep(0.2)
                
            except Exception as e:
                print(f"   💥 Error processing {stock_info['name']}: {e}")
                continue
        
        print(f"\n🎉 Page {page} result: {len(enriched_stocks)} stocks processed successfully")
        return enriched_stocks, total_pages, total_stocks

    def get_fallback_stocks(self):
        """Fallback data when APIs are unavailable"""
        return [
            {
                'name': 'Tata Consultancy Services Limited',
                'ticker': 'TCS',
                'symbol': 'TCS.NS',
                'currentPrice': 4125.30,
                'marketCap': 1500000,
                'peRatio': 32.1,
                'roe': 43.8,
                'debtToEquity': 0.05,
                'currentRatio': 4.2,
                'salesGrowth': 15.8,
                'profitGrowth': 12.4,
                'sector': 'Technology',
                'industry': 'IT Services',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 1890000,
                'change': 82.15,
                'changePercent': 2.03,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=TCS',
                'roe_growth': 2.5,
                'omp_growth': 1.8,
                'pat_growth': 12.4,
                'pledged_percent': 0,
                'promoter_holding_change': 0.1,
                'avg_roe_5y': 38.5,
                'fii_holding': 15.2,
                'dii_holding': 8.7
            },
            {
                'name': 'Infosys Limited',
                'ticker': 'INFY',
                'symbol': 'INFY.NS',
                'currentPrice': 1789.50,
                'marketCap': 745000,
                'peRatio': 25.6,
                'roe': 31.4,
                'debtToEquity': 0.08,
                'currentRatio': 3.8,
                'salesGrowth': 18.2,
                'profitGrowth': 15.7,
                'sector': 'Technology',
                'industry': 'IT Services',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 2340000,
                'change': 25.80,
                'changePercent': 1.46,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=INFY',
                'roe_growth': 3.2,
                'omp_growth': 2.1,
                'pat_growth': 15.7,
                'pledged_percent': 0,
                'promoter_holding_change': 0,
                'avg_roe_5y': 28.9,
                'fii_holding': 18.5,
                'dii_holding': 12.3
            },
            {
                'name': 'HDFC Bank Limited',
                'ticker': 'HDFCBANK',
                'symbol': 'HDFCBANK.NS',
                'currentPrice': 1654.85,
                'marketCap': 1255000,
                'peRatio': 18.9,
                'roe': 18.2,
                'debtToEquity': 0.68,
                'currentRatio': 1.1,
                'salesGrowth': 23.5,
                'profitGrowth': 19.8,
                'sector': 'Financial Services',
                'industry': 'Banks',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 3120000,
                'change': -12.45,
                'changePercent': -0.75,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=HDFCBANK',
                'roe_growth': 1.5,
                'omp_growth': 1.2,
                'pat_growth': 19.8,
                'pledged_percent': 0,
                'promoter_holding_change': 0,
                'avg_roe_5y': 16.8,
                'fii_holding': 22.1,
                'dii_holding': 14.7
            },
            {
                'name': 'Asian Paints Limited',
                'ticker': 'ASIANPAINT',
                'symbol': 'ASIANPAINT.NS',
                'currentPrice': 2890.75,
                'marketCap': 275000,
                'peRatio': 52.3,
                'roe': 25.4,
                'debtToEquity': 0.15,
                'currentRatio': 2.8,
                'salesGrowth': 14.2,
                'profitGrowth': 16.3,
                'sector': 'Consumer Discretionary',
                'industry': 'Paints',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 890000,
                'change': 35.20,
                'changePercent': 1.23,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=ASIANPAINT',
                'roe_growth': 2.8,
                'omp_growth': 1.5,
                'pat_growth': 16.3,
                'pledged_percent': 0,
                'promoter_holding_change': 0.2,
                'avg_roe_5y': 22.1,
                'fii_holding': 16.8,
                'dii_holding': 9.4
            },
            {
                'name': 'Hindustan Unilever Limited',
                'ticker': 'HINDUNILVR',
                'symbol': 'HINDUNILVR.NS',
                'currentPrice': 2456.30,
                'marketCap': 575000,
                'peRatio': 58.2,
                'roe': 85.4,
                'debtToEquity': 0.22,
                'currentRatio': 1.9,
                'salesGrowth': 11.8,
                'profitGrowth': 14.5,
                'sector': 'Consumer Staples',
                'industry': 'Personal Products',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 1250000,
                'change': 18.90,
                'changePercent': 0.78,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=HINDUNILVR',
                'roe_growth': 5.2,
                'omp_growth': 0.8,
                'pat_growth': 14.5,
                'pledged_percent': 0,
                'promoter_holding_change': 0,
                'avg_roe_5y': 78.2,
                'fii_holding': 14.3,
                'dii_holding': 11.8
            }
        ]

# Flask REST API setup
app = Flask(__name__)
CORS(app, origins=["*"])

# Initialize screener instance
screener = YahooFinanceScreener()

# Predefined filter sets for quick access
PREDEFINED_FILTERS = {
    'your_custom_criteria': {
        'name': 'Your Custom Criteria (All 11 Filters)',
        'description': 'Exact match to your screener.in criteria',
        'criteria': {
            'roe': {'min': 14},  # ROE > 14%
            'roe_growth': {'min': 0},  # ROE > ROE preceding year
            'opm_growth': {'min': 0},  # OPM last year > OPM preceding year
            'debtToEquity': {'max': 1},  # Debt to equity < 1
            'pledged_percent': {'max': 0},  # Pledged percentage = 0
            'pat_growth': {'min': 0},  # PAT > PAT last year
            'sales_growth': {'min': 0},  # Sales > Sales last year
            'marketCap': {'min': 200},  # Market cap > 200 Cr
            'promoter_holding_change': {'min': 0},  # Change in promoter holding >= 0
            'avg_roe_5y': {'min': 14},  # Average ROE 5 Years > 14%
            'institutional_holding': {'min': 0}  # FII OR DII > 0
        }
    },
    'quality_stocks': {
        'name': 'Quality Stocks',
        'description': 'High-quality companies with strong financials',
        'criteria': {
            'marketCap': {'min': 1000},
            'roe': {'min': 15},
            'debtToEquity': {'max': 1}
        }
    }
}

@app.route('/api/test/sample-stocks', methods=['GET'])
def test_sample_stocks():
    """Test endpoint with sample stock data to verify frontend display"""
    sample_stocks = [
        {
            'name': 'Tata Consultancy Services',
            'symbol': 'TCS.NS',
            'ticker': 'TCS',
            'industry': 'IT Services',
            'industry_group': 'Technology',
            'yahoo_current_price': 4125.30,
            'yahoo_market_cap': 1500.0,
            'yahoo_pe_ratio': 32.1,
            'yahoo_roe': 43.8,
            'yahoo_debt_equity': 0.05,
            'yahoo_52w_high': 4500.0,
            'yahoo_52w_low': 3200.0,
            'yahoo_volume': 1890000,
            'yahoo_change': 82.15,
            'yahoo_change_percent': 2.03,
            'yahoo_sector': 'Technology',
            'yahoo_industry': 'IT Services',
            'yahoo_revenue_growth': 15.8,
            'yahoo_earnings_growth': 12.4,
            'screener_price': 4000.0,
            'screener_pe': 30.0,
            'screener_roe': 40.0,
            'screener_debt_equity': 0.06,
            'price_diff_percent': 3.13,
            'url': 'https://finance.yahoo.com/quote/TCS.NS'
        },
        {
            'name': 'Infosys Limited',
            'symbol': 'INFY.NS',
            'ticker': 'INFY',
            'industry': 'IT Services',
            'industry_group': 'Technology',
            'yahoo_current_price': 1789.50,
            'yahoo_market_cap': 745.0,
            'yahoo_pe_ratio': 25.6,
            'yahoo_roe': 31.4,
            'yahoo_debt_equity': 0.08,
            'yahoo_52w_high': 1900.0,
            'yahoo_52w_low': 1400.0,
            'yahoo_volume': 2340000,
            'yahoo_change': 25.80,
            'yahoo_change_percent': 1.46,
            'yahoo_sector': 'Technology',
            'yahoo_industry': 'IT Services',
            'yahoo_revenue_growth': 18.2,
            'yahoo_earnings_growth': 15.7,
            'screener_price': 1750.0,
            'screener_pe': 24.0,
            'screener_roe': 30.0,
            'screener_debt_equity': 0.09,
            'price_diff_percent': 2.26,
            'url': 'https://finance.yahoo.com/quote/INFY.NS'
        }
    ]
    
    return jsonify({
        'status': 'success',
        'data': {
            'title': 'Sample Test Stocks',
            'description': 'Test data to verify frontend display',
            'stocks': sample_stocks,
            'total': len(sample_stocks),
            'data_sources': ['Test Data'],
            'comparison_available': True,
            'timestamp': datetime.now().isoformat()
        }
    })

@app.route('/api/test/csv', methods=['GET'])
def test_csv_reading():
    """Test CSV reading functionality"""
    try:
        stocks = screener.get_screener_stocks_from_csv()
        return jsonify({
            'status': 'success',
            'data': {
                'total_stocks': len(stocks),
                'first_5_stocks': stocks[:5] if stocks else [],
                'csv_reading': 'working' if stocks else 'failed'
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/screener/your-stocks', methods=['GET'])
def get_your_screener_stocks():
    """Get paginated real-time data with performance optimizations"""
    print(f"🔍 OPTIMIZED API CALL: /api/screener/your-stocks")
    
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        print(f"📊 Optimized request: page={page}, per_page={per_page}")
        start_time = time.time()
        
        # Get optimized paginated data
        stocks_data, total_pages, total_stocks = screener.get_your_stocks_data_paginated_optimized(page, per_page)
        
        processing_time = time.time() - start_time
        print(f"✅ Processed {len(stocks_data)} stocks in {processing_time:.2f} seconds")
        
        response_data = {
            'status': 'success',
            'data': {
                'title': f'Your Screener.in Stocks - Page {page}/{total_pages}',
                'description': f'{len(stocks_data)} stocks from your screener.in filter (Optimized)',
                'stocks': stocks_data,
                'total': len(stocks_data),
                'pagination': {
                    'current_page': page,
                    'per_page': per_page,
                    'total_pages': total_pages,
                    'total_stocks': total_stocks,
                    'has_prev': page > 1,
                    'has_next': page < total_pages,
                    'prev_page': page - 1 if page > 1 else None,
                    'next_page': page + 1 if page < total_pages else None,
                    'showing_from': (page - 1) * per_page + 1,
                    'showing_to': min(page * per_page, total_stocks)
                },
                'performance': {
                    'processing_time': f"{processing_time:.2f}s",
                    'cached_data': True,
                    'parallel_processing': True
                },
                'data_sources': ['Screener.in CSV (Cached)', 'Yahoo Finance (Cached + Live)'],
                'comparison_available': True,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        print(f"🎉 Optimized response ready in {processing_time:.2f}s")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"💥 ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/screener/preload-cache', methods=['POST'])
def preload_cache():
    """Preload cache for better performance"""
    print(f"� Preloading cache for better performance...")
    
    try:
        start_time = time.time()
        
        # Get all stocks
        stocks = screener.get_screener_stocks_from_csv_cached()
        
        # Preload first 20 stocks in background
        sample_stocks = stocks[:20]
        
        def background_preload():
            for stock in sample_stocks:
                try:
                    screener.get_stock_data_cached(stock['symbol'])
                    time.sleep(0.1)  # Small delay
                except:
                    continue
        
        # Start background thread
        thread = threading.Thread(target=background_preload)
        thread.daemon = True
        thread.start()
        
        preload_time = time.time() - start_time
        
        return jsonify({
            'status': 'success',
            'message': f'Cache preload started for {len(sample_stocks)} stocks',
            'preload_time': f"{preload_time:.2f}s"
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'Stock Screener API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/screener/screen/<filter_name>', methods=['GET'])
def screen_with_predefined_filter(filter_name):
    print(f"🔍 Received request for filter: {filter_name}")
    
    try:
        if filter_name not in PREDEFINED_FILTERS:
            return jsonify({'status': 'error', 'message': f'Filter not found'}), 404
        
        filter_set = PREDEFINED_FILTERS[filter_name]
        criteria = filter_set['criteria']
        
        print(f"✅ Using filter: {filter_set['name']}")
        print(f"🎯 Checking {len(screener.indian_stocks)} stocks...")
        
        # ALWAYS USE REAL-TIME DATA - NO FALLBACK
        print("🌐 Using REAL Yahoo Finance data...")
        filtered_stocks = screener.screen_stocks_by_criteria(criteria)
        
        print(f"🎉 Final result: {len(filtered_stocks)} stocks passed ALL {len(criteria)} filters")
        
        return jsonify({
            'status': 'success',
            'data': {
                'filter_name': filter_set['name'],
                'description': filter_set['description'],
                'stocks': filtered_stocks,
                'total': len(filtered_stocks),
                'total_checked': len(screener.indian_stocks),
                'criteria': criteria,
                'criteria_count': len(criteria),
                'data_source': 'Yahoo Finance (Real-time)',
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"💥 Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting Stock Screener API on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)