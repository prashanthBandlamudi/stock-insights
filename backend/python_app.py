from flask import Flask, request, jsonify
from flask_cors import CORS
import tvscreener as tvs
import pandas as pd
from datetime import datetime
import pandas as pd

app = Flask(__name__)
CORS(app)

class TradingViewScreenerService:
    def __init__(self):
        self.screener = tvs.StockScreener()
        
    def get_predefined_filters(self):
        """Get predefined high-quality stock filters"""
        return {
            'quality-stocks': {
                'name': 'Quality Stocks',
                'description': 'High-quality companies with strong financials',
                'criteria': {
                    'marketCap': {'min': 1000},  # > ₹1,000 Cr
                    'roe': {'min': 15},           # > 15% ROE
                    'debtToEquity': {'max': 1},   # < 1 D/E ratio
                    'currentRatio': {'min': 1},   # > 1 Current ratio
                    'salesGrowth': {'min': 10},   # > 10% Sales growth
                    'profitGrowth': {'min': 10},  # > 10% Profit growth
                }
            },
            'large-cap-stable': {
                'name': 'Large Cap Stable',
                'description': 'Established large-cap companies',
                'criteria': {
                    'marketCap': {'min': 50000}, # > ₹50,000 Cr
                    'roe': {'min': 12},          # > 12% ROE
                    'debtToEquity': {'max': 0.8}, # < 0.8 D/E
                    'peRatio': {'min': 10, 'max': 25}, # 10-25 P/E
                }
            },
            'mid-cap-growth': {
                'name': 'Mid Cap Growth',
                'description': 'Growing mid-cap companies',
                'criteria': {
                    'marketCap': {'min': 5000, 'max': 50000}, # ₹5,000-50,000 Cr
                    'roe': {'min': 18},          # > 18% ROE
                    'salesGrowth': {'min': 15},  # > 15% Sales growth
                    'profitGrowth': {'min': 15}, # > 15% Profit growth
                }
            },
            'dividend-aristocrats': {
                'name': 'Dividend Aristocrats',
                'description': 'Reliable dividend-paying companies',
                'criteria': {
                    'marketCap': {'min': 10000}, # > ₹10,000 Cr
                    'roe': {'min': 10},          # > 10% ROE
                    'debtToEquity': {'max': 0.5}, # < 0.5 D/E
                    'currentRatio': {'min': 1.5}, # > 1.5 Current ratio
                }
            }
        }
    
    def apply_filters(self, filter_criteria):
        """Apply filter criteria to the screener"""
        # Reset screener
        self.screener = tvs.StockScreener()
        
        # Set market to India (you can modify this)
        self.screener.set_tickers_source(tvs.StocksMarket.INDIA)
        
        # Apply filters based on criteria
        if 'marketCap' in filter_criteria:
            if 'min' in filter_criteria['marketCap']:
                self.screener.add_filter(
                    tvs.StockField.MARKET_CAPITALIZATION, 
                    tvs.FilterOperator.ABOVE_OR_EQUAL, 
                    filter_criteria['marketCap']['min'] * 10000000  # Convert Cr to actual value
                )
            if 'max' in filter_criteria['marketCap']:
                self.screener.add_filter(
                    tvs.StockField.MARKET_CAPITALIZATION, 
                    tvs.FilterOperator.BELOW_OR_EQUAL, 
                    filter_criteria['marketCap']['max'] * 10000000
                )
        
        if 'peRatio' in filter_criteria:
            if 'min' in filter_criteria['peRatio'] and 'max' in filter_criteria['peRatio']:
                self.screener.add_filter(
                    tvs.StockField.PRICE_EARNINGS_RATIO_TTM,
                    tvs.FilterOperator.IN_RANGE,
                    [filter_criteria['peRatio']['min'], filter_criteria['peRatio']['max']]
                )
            elif 'min' in filter_criteria['peRatio']:
                self.screener.add_filter(
                    tvs.StockField.PRICE_EARNINGS_RATIO_TTM,
                    tvs.FilterOperator.ABOVE_OR_EQUAL,
                    filter_criteria['peRatio']['min']
                )
        
        if 'roe' in filter_criteria and 'min' in filter_criteria['roe']:
            self.screener.add_filter(
                tvs.StockField.RETURN_ON_EQUITY_MRQ,
                tvs.FilterOperator.ABOVE_OR_EQUAL,
                filter_criteria['roe']['min']
            )
        
        if 'debtToEquity' in filter_criteria and 'max' in filter_criteria['debtToEquity']:
            self.screener.add_filter(
                tvs.StockField.DEBT_TO_EQUITY_RATIO_MRQ,
                tvs.FilterOperator.BELOW_OR_EQUAL,
                filter_criteria['debtToEquity']['max']
            )
        
        if 'currentRatio' in filter_criteria and 'min' in filter_criteria['currentRatio']:
            self.screener.add_filter(
                tvs.StockField.CURRENT_RATIO_MRQ,
                tvs.FilterOperator.ABOVE_OR_EQUAL,
                filter_criteria['currentRatio']['min']
            )
        
        if 'salesGrowth' in filter_criteria and 'min' in filter_criteria['salesGrowth']:
            self.screener.add_filter(
                tvs.StockField.REVENUE_GROWTH_YOY_TTM,
                tvs.FilterOperator.ABOVE_OR_EQUAL,
                filter_criteria['salesGrowth']['min']
            )
        
        if 'profitGrowth' in filter_criteria and 'min' in filter_criteria['profitGrowth']:
            self.screener.add_filter(
                tvs.StockField.NET_INCOME_YOY_GROWTH_TTM,
                tvs.FilterOperator.ABOVE_OR_EQUAL,
                filter_criteria['profitGrowth']['min']
            )
    
    def fetch_stocks(self, filter_name):
        """Fetch stocks using predefined filters"""
        try:
            filters = self.get_predefined_filters()
            
            if filter_name not in filters:
                return {'success': False, 'message': f'Filter {filter_name} not found'}
            
            filter_config = filters[filter_name]['criteria']
            self.apply_filters(filter_config)
            
            # Set range to get more results
            self.screener.set_range(0, 500)
            
            # Get the data
            df = self.screener.get()
            
            # Convert to our format
            stocks = []
            for index, row in df.iterrows():
                try:
                    stock = {
                        'name': row.get('Name', ''),
                        'ticker': row.get('Symbol', '').split(':')[-1] if ':' in str(row.get('Symbol', '')) else row.get('Symbol', ''),
                        'symbol': row.get('Symbol', ''),
                        'currentPrice': float(row.get('Last', 0) or 0),
                        'marketCap': float(row.get('Market Capitalization', 0) or 0) / 10000000,  # Convert to Cr
                        'peRatio': float(row.get('Price/Earnings Ratio (TTM)', 0) or 0),
                        'roe': float(row.get('Return on Equity (MRQ)', 0) or 0),
                        'debtToEquity': float(row.get('Debt to Equity Ratio (MRQ)', 0) or 0),
                        'currentRatio': float(row.get('Current Ratio (MRQ)', 0) or 0),
                        'salesGrowth': float(row.get('Revenue Growth (YoY TTM)', 0) or 0),
                        'profitGrowth': float(row.get('Net Income Growth (YoY TTM)', 0) or 0),
                        'sector': row.get('Sector', 'Unknown'),
                        'industry': row.get('Industry', 'Unknown'),
                        'country': row.get('Country', 'Unknown'),
                        'exchange': row.get('Exchange', 'Unknown'),
                        'volume': float(row.get('Volume', 0) or 0),
                        'change': float(row.get('Change', 0) or 0),
                        'changePercent': float(row.get('Change %', 0) or 0),
                        'url': f"https://in.tradingview.com/symbols/{row.get('Symbol', '')}" if row.get('Symbol') else ''
                    }
                    stocks.append(stock)
                except Exception as e:
                    print(f"Error processing row: {e}")
                    continue
            
            return {
                'success': True, 
                'data': stocks,
                'count': len(stocks),
                'filter_used': filter_name,
                'filter_criteria': filter_config
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to fetch stocks: {str(e)}'}

# Initialize service
screener_service = TradingViewScreenerService()

# Routes
@app.route('/api/screener/filters', methods=['GET'])
def get_filters():
    """Get available predefined filters"""
    filters = screener_service.get_predefined_filters()
    return jsonify({'success': True, 'data': filters})

@app.route('/api/screener/fetch-stocks', methods=['POST'])
def fetch_stocks():
    """Fetch stocks using TradingView screener - Mock data for testing"""
    try:
        data = request.get_json()
        filter_name = data.get('filter', 'quality-stocks')
        
        # Return mock data for now to test UI integration
        mock_stocks = [
            {
                'name': 'Reliance Industries',
                'ticker': 'RELIANCE',
                'symbol': 'RELIANCE',
                'currentPrice': 2855.75,
                'marketCap': 1933000,
                'peRatio': 28.4,
                'roe': 11.2,
                'debtToEquity': 0.35,
                'currentRatio': 1.8,
                'salesGrowth': 22.1,
                'profitGrowth': 18.5,
                'sector': 'Oil & Gas',
                'industry': 'Refineries',
                'country': 'India',
                'exchange': 'NSE',
                'volume': 4250000,
                'change': 45.20,
                'changePercent': 1.61,
                'url': 'https://tradingview.com/symbols/NSE-RELIANCE/'
            },
            {
                'name': 'Tata Consultancy Services',
                'ticker': 'TCS',
                'symbol': 'TCS',
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
                'url': 'https://tradingview.com/symbols/NSE-TCS/'
            },
            {
                'name': 'HDFC Bank',
                'ticker': 'HDFCBANK',
                'symbol': 'HDFCBANK',
                'currentPrice': 1654.85,
                'marketCap': 1255000,
                'peRatio': 18.9,
                'roe': 18.2,
                'debtToEquity': 6.8,
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
                'url': 'https://tradingview.com/symbols/NSE-HDFCBANK/'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': mock_stocks,
            'message': f'Successfully fetched {len(mock_stocks)} stocks using {filter_name} filter',
            'filter_applied': filter_name
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch stocks: {str(e)}'
        }), 500

@app.route('/api/screener/custom-filter', methods=['POST'])
def custom_filter():
    """Apply custom filter criteria"""
    data = request.get_json()
    filter_criteria = data.get('criteria', {})
    
    try:
        screener_service.apply_filters(filter_criteria)
        screener_service.screener.set_range(0, 500)
        df = screener_service.screener.get()
        
        # Convert DataFrame to our format (similar to fetch_stocks)
        stocks = []
        for index, row in df.iterrows():
            try:
                stock = {
                    'name': row.get('Name', ''),
                    'ticker': row.get('Symbol', '').split(':')[-1] if ':' in str(row.get('Symbol', '')) else row.get('Symbol', ''),
                    'symbol': row.get('Symbol', ''),
                    'currentPrice': float(row.get('Last', 0) or 0),
                    'marketCap': float(row.get('Market Capitalization', 0) or 0) / 10000000,
                    'peRatio': float(row.get('Price/Earnings Ratio (TTM)', 0) or 0),
                    'roe': float(row.get('Return on Equity (MRQ)', 0) or 0),
                    'debtToEquity': float(row.get('Debt to Equity Ratio (MRQ)', 0) or 0),
                    'sector': row.get('Sector', 'Unknown'),
                    'url': f"https://in.tradingview.com/symbols/{row.get('Symbol', '')}" if row.get('Symbol') else ''
                }
                stocks.append(stock)
            except Exception as e:
                continue
        
        return jsonify({
            'success': True, 
            'data': stocks,
            'count': len(stocks),
            'criteria_used': filter_criteria
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Custom filter failed: {str(e)}'}), 400

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'TradingView Screener API is running', 'version': '2.0'})

# Test route to verify tvscreener is working
@app.route('/api/screener/test', methods=['GET'])
def test_screener():
    """Test if tvscreener is working"""
    try:
        ss = tvs.StockScreener()
        ss.set_range(0, 10)  # Just get 10 stocks for test
        df = ss.get()
        
        return jsonify({
            'success': True, 
            'message': 'TradingView Screener is working!',
            'sample_count': len(df),
            'sample_data': df.head(3).to_dict('records') if len(df) > 0 else []
        })
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'TradingView Screener test failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
