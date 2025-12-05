"""
Enhanced Stock Screener using Yahoo Finance
Real financial data for proper filtering with Flask integration
"""
import requests
import json
import time            # OPM Growth filter (OPM > previous year)
            if 'omp_growth' in criteria:
                omp_growth = stock_data.get('omp_growth', 0)
                if 'min' in criteria['omp_growth'] and omp_growth < criteria['omp_growth']['min']:
                    print(f"  Failed OPM Growth min: {omp_growth} < {criteria['omp_growth']['min']}")
                    return Falsedatetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from flask import Flask, request, jsonify
from flask_cors import CORS

class YahooFinanceScreener:
    def __init__(self):
        # Pre-defined list of major Indian stocks
        self.indian_stocks = [
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
            'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
            'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'SUNPHARMA.NS',
            'TITAN.NS', 'BAJFINANCE.NS', 'ULTRACEMCO.NS', 'NESTLEIND.NS', 'WIPRO.NS',
            'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'TATAMOTORS.NS', 'ADANIGREEN.NS',
            'ADANIPORTS.NS', 'COALINDIA.NS', 'BAJAJFINSV.NS', 'HCLTECH.NS', 'DRREDDY.NS'
        ]
    
    def get_stock_data(self, symbol):
        """Get comprehensive stock data from Yahoo Finance"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # Extract all the financial ratios we need
            return {
                'name': info.get('longName', symbol),
                'ticker': symbol.replace('.NS', ''),
                'symbol': symbol,
                'currentPrice': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                'marketCap': info.get('marketCap', 0) / 10000000,  # Convert to Crores
                'peRatio': info.get('trailingPE', info.get('forwardPE', 0)),
                'roe': info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else 0,
                'debtToEquity': info.get('debtToEquity', 0) / 100 if info.get('debtToEquity') else 0,
                'currentRatio': info.get('currentRatio', 0),
                'salesGrowth': info.get('revenueGrowth', 0) * 100 if info.get('revenueGrowth') else 0,
                'profitGrowth': info.get('earningsGrowth', 0) * 100 if info.get('earningsGrowth') else 0,
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'country': 'India',
                'exchange': 'NSE',
                'volume': info.get('volume', 0),
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0),
                'url': f'https://finance.yahoo.com/quote/{symbol}'
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
        """REAL filtering based on actual financial ratios"""
        try:
            # Market Cap filter
            if 'marketCap' in criteria:
                market_cap = stock_data.get('marketCap', 0)
                if 'min' in criteria['marketCap'] and market_cap < criteria['marketCap']['min']:
                    print(f"  Failed marketCap min: {market_cap} < {criteria['marketCap']['min']}")
                    return False
                if 'max' in criteria['marketCap'] and market_cap > criteria['marketCap']['max']:
                    print(f"  Failed marketCap max: {market_cap} > {criteria['marketCap']['max']}")
                    return False
            
            # PE Ratio filter
            if 'peRatio' in criteria:
                pe_ratio = stock_data.get('peRatio', 0)
                if pe_ratio <= 0:  # Invalid PE ratio
                    print(f"  Failed PE ratio invalid: {pe_ratio}")
                    return False
                if 'min' in criteria['peRatio'] and pe_ratio < criteria['peRatio']['min']:
                    print(f"  Failed PE ratio min: {pe_ratio} < {criteria['peRatio']['min']}")
                    return False
                if 'max' in criteria['peRatio'] and pe_ratio > criteria['peRatio']['max']:
                    print(f"  Failed PE ratio max: {pe_ratio} > {criteria['peRatio']['max']}")
                    return False
            
            # ROE filter
            if 'roe' in criteria:
                roe = stock_data.get('roe', 0)
                if 'min' in criteria['roe'] and roe < criteria['roe']['min']:
                    print(f"  Failed ROE min: {roe} < {criteria['roe']['min']}")
                    return False
            
            # Debt to Equity filter
            if 'debtToEquity' in criteria:
                debt_ratio = stock_data.get('debtToEquity', 0)
                if 'max' in criteria['debtToEquity'] and debt_ratio > criteria['debtToEquity']['max']:
                    print(f"  Failed Debt/Equity max: {debt_ratio} > {criteria['debtToEquity']['max']}")
                    return False
            
            # Current Ratio filter
            if 'currentRatio' in criteria:
                current_ratio = stock_data.get('currentRatio', 0)
                if 'min' in criteria['currentRatio'] and current_ratio < criteria['currentRatio']['min']:
                    print(f"  Failed Current Ratio min: {current_ratio} < {criteria['currentRatio']['min']}")
                    return False
            
            # Sales Growth filter
            if 'salesGrowth' in criteria:
                sales_growth = stock_data.get('salesGrowth', 0)
                if 'min' in criteria['salesGrowth'] and sales_growth < criteria['salesGrowth']['min']:
                    print(f"  Failed Sales Growth min: {sales_growth} < {criteria['salesGrowth']['min']}")
                    return False
            
            # Profit Growth filter
            if 'profitGrowth' in criteria:
                profit_growth = stock_data.get('profitGrowth', 0)
                if 'min' in criteria['profitGrowth'] and profit_growth < criteria['profitGrowth']['min']:
                    print(f"  Failed Profit Growth min: {profit_growth} < {criteria['profitGrowth']['min']}")
                    return False
            
            # Your Custom Criteria Fields
            
            # ROE Growth filter (ROE > previous year)
            if 'roe_growth' in criteria:
                roe_growth = stock_data.get('roe_growth', 0)
                if 'min' in criteria['roe_growth'] and roe_growth < criteria['roe_growth']['min']:
                    print(f"  Failed ROE Growth min: {roe_growth} < {criteria['roe_growth']['min']}")
                    return False
            
            # OPM Growth filter (OPM > previous year)
            if 'opm_growth' in criteria:
                opm_growth = stock_data.get('opm_growth', 0)
                if 'min' in criteria['opm_growth'] and omp_growth < criteria['opm_growth']['min']:
                    print(f"  Failed OPM Growth min: {omp_growth} < {criteria['opm_growth']['min']}")
                    return False
            
            # PAT Growth filter (PAT > previous year)
            if 'pat_growth' in criteria:
                pat_growth = stock_data.get('pat_growth', 0)
                if 'min' in criteria['pat_growth'] and pat_growth < criteria['pat_growth']['min']:
                    print(f"  Failed PAT Growth min: {pat_growth} < {criteria['pat_growth']['min']}")
                    return False
            
            # Sales Growth filter (Sales > previous year)
            if 'sales_growth' in criteria:
                sales_growth = stock_data.get('salesGrowth', 0)  # Use existing field
                if 'min' in criteria['sales_growth'] and sales_growth < criteria['sales_growth']['min']:
                    print(f"  Failed Sales Growth min: {sales_growth} < {criteria['sales_growth']['min']}")
                    return False
            
            # Pledged Percentage filter (= 0)
            if 'pledged_percent' in criteria:
                pledged_percent = stock_data.get('pledged_percent', 0)
                if 'max' in criteria['pledged_percent'] and pledged_percent > criteria['pledged_percent']['max']:
                    print(f"  Failed Pledged Percent max: {pledged_percent} > {criteria['pledged_percent']['max']}")
                    return False
            
            # Promoter Holding Change filter (>= 0)
            if 'promoter_holding_change' in criteria:
                promoter_change = stock_data.get('promoter_holding_change', 0)
                if 'min' in criteria['promoter_holding_change'] and promoter_change < criteria['promoter_holding_change']['min']:
                    print(f"  Failed Promoter Change min: {promoter_change} < {criteria['promoter_holding_change']['min']}")
                    return False
            
            # Average ROE 5 Years filter (> 14%)
            if 'avg_roe_5y' in criteria:
                avg_roe_5y = stock_data.get('avg_roe_5y', 0)
                if 'min' in criteria['avg_roe_5y'] and avg_roe_5y < criteria['avg_roe_5y']['min']:
                    print(f"  Failed Avg ROE 5Y min: {avg_roe_5y} < {criteria['avg_roe_5y']['min']}")
                    return False
            
            # Institutional Holding filter (FII > 0 OR DII > 0)
            if 'institutional_holding' in criteria:
                fii_holding = stock_data.get('fii_holding', 0)
                dii_holding = stock_data.get('dii_holding', 0)
                if 'min' in criteria['institutional_holding']:
                    min_required = criteria['institutional_holding']['min']
                    if not (fii_holding > min_required or dii_holding > min_required):
                        print(f"  Failed Institutional Holding: FII={fii_holding}, DII={dii_holding}, both <= {min_required}")
                        return False
            
            print(f"  ✓ All criteria passed")
            return True
            
        except Exception as e:
            print(f"  Error in criteria check: {e}")
            return False
    
    def get_fallback_stocks(self):
        """Fallback data when APIs are unavailable"""
        return [
            {
                'name': 'Tata Consultancy Services Limited',
                'ticker': 'TCS',
                'symbol': 'TCS.NS',
                'currentPrice': 4125.30,
                'marketCap': 1500000,  # > 200 Cr ✓
                'peRatio': 32.1,
                'roe': 43.8,  # > 14% ✓
                'debtToEquity': 0.05,  # < 1 ✓
                'currentRatio': 4.2,
                'salesGrowth': 15.8,  # > 0 ✓
                'profitGrowth': 12.4,  # > 0 ✓
                'sector': 'Technology',
                'industry': 'IT Services',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 1890000,
                'change': 82.15,
                'changePercent': 2.03,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=TCS',
                # Your criteria fields
                'roe_growth': 2.5,  # ROE increased from 41.3% to 43.8% ✓
                'opm_growth': 1.8,  # OPM increased ✓
                'pat_growth': 12.4,  # PAT growth ✓
                'pledged_percent': 0,  # ✓
                'promoter_holding_change': 0.1,  # ✓
                'avg_roe_5y': 38.5,  # > 14% ✓
                'fii_holding': 15.2,  # > 0 ✓
                'dii_holding': 8.7   # > 0 ✓
            },
            {
                'name': 'Infosys Limited',
                'ticker': 'INFY',
                'symbol': 'INFY.NS',
                'currentPrice': 1789.50,
                'marketCap': 745000,  # > 200 Cr ✓
                'peRatio': 25.6,
                'roe': 31.4,  # > 14% ✓
                'debtToEquity': 0.08,  # < 1 ✓
                'currentRatio': 3.8,
                'salesGrowth': 18.2,  # > 0 ✓
                'profitGrowth': 15.7,  # > 0 ✓
                'sector': 'Technology',
                'industry': 'IT Services',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 2340000,
                'change': 25.80,
                'changePercent': 1.46,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=INFY',
                # Your criteria fields
                'roe_growth': 3.2,  # ROE increased ✓
                'omp_growth': 2.1,  # OPM increased ✓
                'pat_growth': 15.7,  # PAT growth ✓
                'pledged_percent': 0,  # ✓
                'promoter_holding_change': 0,  # ✓
                'avg_roe_5y': 28.9,  # > 14% ✓
                'fii_holding': 18.5,  # > 0 ✓
                'dii_holding': 12.3   # > 0 ✓
            },
            {
                'name': 'HDFC Bank Limited',
                'ticker': 'HDFCBANK',
                'symbol': 'HDFCBANK.NS',
                'currentPrice': 1654.85,
                'marketCap': 1255000,  # > 200 Cr ✓
                'peRatio': 18.9,
                'roe': 18.2,  # > 14% ✓
                'debtToEquity': 0.68,  # < 1 ✓ (for banks, this is good)
                'currentRatio': 1.1,
                'salesGrowth': 23.5,  # > 0 ✓
                'profitGrowth': 19.8,  # > 0 ✓
                'sector': 'Financial Services',
                'industry': 'Banks',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 3120000,
                'change': -12.45,
                'changePercent': -0.75,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=HDFCBANK',
                # Your criteria fields
                'roe_growth': 1.5,  # ROE increased ✓
                'omp_growth': 1.2,  # OPM increased ✓
                'pat_growth': 19.8,  # PAT growth ✓
                'pledged_percent': 0,  # ✓
                'promoter_holding_change': 0,  # ✓
                'avg_roe_5y': 16.8,  # > 14% ✓
                'fii_holding': 22.1,  # > 0 ✓
                'dii_holding': 14.7   # > 0 ✓
            },
            {
                'name': 'Asian Paints Limited',
                'ticker': 'ASIANPAINT',
                'symbol': 'ASIANPAINT.NS',
                'currentPrice': 2890.75,
                'marketCap': 275000,  # > 200 Cr ✓
                'peRatio': 52.3,
                'roe': 25.4,  # > 14% ✓
                'debtToEquity': 0.15,  # < 1 ✓
                'currentRatio': 2.8,
                'salesGrowth': 14.2,  # > 0 ✓
                'profitGrowth': 16.3,  # > 0 ✓
                'sector': 'Consumer Discretionary',
                'industry': 'Paints',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 890000,
                'change': 35.20,
                'changePercent': 1.23,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=ASIANPAINT',
                # Your criteria fields
                'roe_growth': 2.8,  # ROE increased ✓
                'omp_growth': 1.5,  # OPM increased ✓
                'pat_growth': 16.3,  # PAT growth ✓
                'pledged_percent': 0,  # ✓
                'promoter_holding_change': 0.2,  # ✓
                'avg_roe_5y': 22.1,  # > 14% ✓
                'fii_holding': 16.8,  # > 0 ✓
                'dii_holding': 9.4   # > 0 ✓
            },
            {
                'name': 'Hindustan Unilever Limited',
                'ticker': 'HINDUNILVR',
                'symbol': 'HINDUNILVR.NS',
                'currentPrice': 2456.30,
                'marketCap': 575000,  # > 200 Cr ✓
                'peRatio': 58.2,
                'roe': 85.4,  # > 14% ✓ (Very high due to low equity base)
                'debtToEquity': 0.22,  # < 1 ✓
                'currentRatio': 1.9,
                'salesGrowth': 11.8,  # > 0 ✓
                'profitGrowth': 14.5,  # > 0 ✓
                'sector': 'Consumer Staples',
                'industry': 'Personal Products',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 1250000,
                'change': 18.90,
                'changePercent': 0.78,
                'url': 'https://www.nseindia.com/get-quotes/equity?symbol=HINDUNILVR',
                # Your criteria fields
                'roe_growth': 5.2,  # ROE increased ✓
                'omp_growth': 0.8,  # OPM increased ✓
                'pat_growth': 14.5,  # PAT growth ✓
                'pledged_percent': 0,  # ✓
                'promoter_holding_change': 0,  # ✓
                'avg_roe_5y': 78.2,  # > 14% ✓
                'fii_holding': 14.3,  # > 0 ✓
                'dii_holding': 11.8   # > 0 ✓
            }
        ]

# Flask REST API setup
app = Flask(__name__)

# Configure CORS more explicitly
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize screener instance
screener = YahooFinanceScreener()

# Predefined filter sets for quick access
PREDEFINED_FILTERS = {
    'your_custom_criteria': {
        'name': 'Your Custom Criteria',
        'description': 'Stocks matching your specific investment criteria',
        'criteria': {
            'roe': {'min': 14},  # ROE > 14%
            'debtToEquity': {'max': 1},  # D/E < 1
            'marketCap': {'min': 200},  # Market cap > 200 Cr
            'roe_growth': {'min': 0},  # ROE > previous year
            'opm_growth': {'min': 0},  # OPM > previous year
            'pat_growth': {'min': 0},  # PAT > previous year
            'sales_growth': {'min': 0},  # Sales > previous year
            'pledged_percent': {'max': 0},  # Pledged % = 0
            'promoter_holding_change': {'min': 0},  # Change >= 0
            'avg_roe_5y': {'min': 14},  # 5Y avg ROE > 14%
            'institutional_holding': {'min': 0}  # FII or DII > 0
        }
    },
    'quality_stocks': {
        'name': 'Quality Stocks',
        'description': 'High-quality companies with strong financials',
        'criteria': {
            'marketCap': {'min': 1000},  # > ₹1,000 Cr
            'peRatio': {'min': 10, 'max': 30},  # PE between 10-30
            'roe': {'min': 15},  # ROE > 15%
            'debtToEquity': {'max': 1},  # D/E < 1
            'currentRatio': {'min': 1.2}  # Current ratio > 1.2
        }
    },
    'large_cap_stable': {
        'name': 'Large Cap Stable',
        'description': 'Large cap stocks with stable growth',
        'criteria': {
            'marketCap': {'min': 50000},  # > ₹50,000 Cr
            'peRatio': {'min': 15, 'max': 25},  # PE between 15-25
            'roe': {'min': 12},  # ROE > 12%
            'debtToEquity': {'max': 0.5},  # D/E < 0.5
        }
    },
    'mid_cap_growth': {
        'name': 'Mid Cap Growth',
        'description': 'Mid cap stocks with high growth potential',
        'criteria': {
            'marketCap': {'min': 5000, 'max': 50000},  # ₹5,000-50,000 Cr
            'roe': {'min': 18},  # ROE > 18%
            'salesGrowth': {'min': 15},  # Sales growth > 15%
            'profitGrowth': {'min': 12}  # Profit growth > 12%
        }
    },
    'dividend_aristocrats': {
        'name': 'Dividend Aristocrats',
        'description': 'Consistent dividend paying companies',
        'criteria': {
            'marketCap': {'min': 10000},  # > ₹10,000 Cr
            'roe': {'min': 12},  # ROE > 12%
            'debtToEquity': {'max': 0.8},  # D/E < 0.8
            'currentRatio': {'min': 1.5}  # Current ratio > 1.5
        }
    }
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'Stock Screener API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/screener/filters', methods=['GET'])
def get_predefined_filters():
    """Get all predefined filter sets"""
    return jsonify({
        'status': 'success',
        'filters': PREDEFINED_FILTERS
    })

@app.route('/api/screener/screen', methods=['POST'])
def screen_stocks():
    """Screen stocks based on provided criteria"""
    try:
        data = request.get_json()
        
        if not data or 'criteria' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No criteria provided'
            }), 400
        
        criteria = data['criteria']
        use_fallback = data.get('useFallback', False)
        
        if use_fallback:
            # Return fallback data for testing
            stocks = screener.get_fallback_stocks()
            # Apply filtering to fallback data
            filtered_stocks = [stock for stock in stocks if screener.meets_criteria(stock, criteria)]
        else:
            # Use real Yahoo Finance data
            filtered_stocks = screener.screen_stocks_by_criteria(criteria)
        
        return jsonify({
            'status': 'success',
            'data': {
                'stocks': filtered_stocks,
                'total': len(filtered_stocks),
                'criteria': criteria,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Screening failed: {str(e)}'
        }), 500

@app.route('/api/screener/screen/<filter_name>', methods=['GET', 'OPTIONS'])
def screen_with_predefined_filter(filter_name):
    """Screen stocks using a predefined filter"""
    print(f"🔍 Received request for filter: {filter_name}")
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(f"📋 Available filters: {list(PREDEFINED_FILTERS.keys())}")
        
        if filter_name not in PREDEFINED_FILTERS:
            print(f"❌ Filter '{filter_name}' not found")
            return jsonify({
                'status': 'error',
                'message': f'Filter "{filter_name}" not found'
            }), 404
        
        filter_set = PREDEFINED_FILTERS[filter_name]
        criteria = filter_set['criteria']
        
        print(f"✅ Using filter: {filter_set['name']}")
        print(f"🎯 Criteria: {criteria}")
        
        # For demo purposes, use fallback data (change to False for real data)
        use_fallback = True
        
        if use_fallback:
            print("📦 Using fallback data...")
            stocks = screener.get_fallback_stocks()
            print(f"📊 Got {len(stocks)} fallback stocks")
            
            filtered_stocks = []
            for stock in stocks:
                if screener.meets_criteria(stock, criteria):
                    filtered_stocks.append(stock)
                    print(f"✅ {stock['name']} passed criteria")
                else:
                    print(f"❌ {stock['name']} failed criteria")
        else:
            print("🌐 Using real Yahoo Finance data...")
            filtered_stocks = screener.screen_stocks_by_criteria(criteria)
        
        print(f"🎉 Final result: {len(filtered_stocks)} stocks passed filter")
        
        response_data = {
            'status': 'success',
            'data': {
                'filter_name': filter_set['name'],
                'description': filter_set['description'],
                'stocks': filtered_stocks,
                'total': len(filtered_stocks),
                'criteria': criteria,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        print(f"📤 Sending response with {len(filtered_stocks)} stocks")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"💥 Error in screen_with_predefined_filter: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'status': 'error',
            'message': f'Screening failed: {str(e)}'
        }), 500

@app.route('/api/stock/<ticker>', methods=['GET'])
def get_stock_details(ticker):
    """Get detailed information for a specific stock"""
    try:
        symbol = f"{ticker}.NS"
        stock_data = screener.get_stock_data(symbol)
        
        if not stock_data:
            return jsonify({
                'status': 'error',
                'message': f'Stock data not found for {ticker}'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': stock_data
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to fetch stock data: {str(e)}'
        }), 500

# Test the screener
if __name__ == "__main__":
    print("🚀 Starting Stock Screener API...")
    print("📊 Available endpoints:")
    print("   GET  /api/health - Health check")
    print("   GET  /api/screener/filters - Get predefined filters")
    print("   POST /api/screener/screen - Screen with custom criteria")
    print("   GET  /api/screener/screen/<filter> - Screen with predefined filter")
    print("   GET  /api/stock/<ticker> - Get stock details")
    print("\n🌐 Server starting on http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
