const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Stock {
  _id?: string;
  stockName: string;
  tickerSymbol: string;
  marketCap?: number;
  peRatio?: number;
  roe?: number;
  debtToEquity?: number;
  currentPrice?: number;
  industry?: string;
  dataDate?: string;
}

export class StockService {
  static async getAll(): Promise<Stock[]> {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  static async getById(id: string): Promise<Stock | null> {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  }

  static async create(stock: Omit<Stock, '_id'>): Promise<Stock> {
    const response = await fetch(`${API_BASE_URL}/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stock),
    });
    const data = await response.json();
    return data.data;
  }

  static async update(id: string, stock: Partial<Stock>): Promise<Stock> {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stock),
    });
    const data = await response.json();
    return data.data;
  }

  static async delete(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'DELETE',
    });
  }
}
