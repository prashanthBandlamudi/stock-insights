/**
 * Service for integrating with TradingView Screener via backend
 * No authentication required - much simpler and more reliable than Screener.in
 */

const API_BASE_URL = 'http://localhost:5001/api';

export interface ScreenerStock {
  name: string;
  ticker: string;
  symbol: string;
  currentPrice: number;
  marketCap: number;
  peRatio: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  salesGrowth: number;
  profitGrowth: number;
  sector: string;
  industry: string;
  country: string;
  exchange: string;
  volume: number;
  change: number;
  changePercent: number;
  url: string;
}

export interface FilterCriteria {
  marketCap?: {
    min?: number;
    max?: number;
  };
  peRatio?: {
    min?: number;
    max?: number;
  };
  roe?: {
    min?: number;
  };
  debtToEquity?: {
    max?: number;
  };
  currentRatio?: {
    min?: number;
  };
  salesGrowth?: {
    min?: number;
  };
  profitGrowth?: {
    min?: number;
  };
}

class ScreenerService {
  /**
   * No authentication needed for TradingView screener!
   */
  async isAuthenticated(): Promise<boolean> {
    return true; // Always authenticated - no login required
  }

  /**
   * Get available predefined filters
   */
  async getAvailableFilters(): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/screener/filters`);
      const data = await response.json();
      return data.success ? data.data : {};
    } catch (error) {
      console.error('Failed to get filters:', error);
      return {};
    }
  }

  /**
   * Fetch stocks using predefined filter
   */
  async fetchScreenedStocks(filterName: string): Promise<ScreenerStock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/screener/fetch-stocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: filterName,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to fetch stocks');
      }
    } catch (error) {
      console.error('Failed to fetch screened stocks:', error);
      throw error;
    }
  }

  /**
   * Fetch stocks using custom filter criteria
   */
  async fetchCustomFilteredStocks(criteria: FilterCriteria): Promise<ScreenerStock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/screener/custom-filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to fetch stocks');
      }
    } catch (error) {
      console.error('Failed to fetch custom filtered stocks:', error);
      throw error;
    }
  }

  /**
   * Get predefined high-quality stock filters (static for frontend use)
   */
  getPredefinedFilters(): Record<string, { name: string; description: string }> {
    return {
      'quality-stocks': {
        name: 'Quality Stocks',
        description: 'High-quality companies with strong financials and growth'
      },
      'large-cap-stable': {
        name: 'Large Cap Stable',
        description: 'Established large-cap companies with stable performance'
      },
      'mid-cap-growth': {
        name: 'Mid Cap Growth',
        description: 'Growing mid-cap companies with high potential'
      },
      'dividend-aristocrats': {
        name: 'Dividend Aristocrats',
        description: 'Reliable dividend-paying companies with strong balance sheets'
      },
    };
  }

  /**
   * Test if the service is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/screener/test`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * No logout needed - stateless service
   */
  async logout(): Promise<void> {
    // No-op - TradingView screener doesn't require authentication
  }
}

export const screenerService = new ScreenerService();
