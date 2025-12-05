import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const router = express.Router();

// Store session cookies per user (in production, use proper session management)
const userSessions = new Map();

// Login to Screener.in
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get CSRF token
    const loginPageResponse = await fetch('https://www.screener.in/login/', {
      method: 'GET',
    });
    
    const loginPageHtml = await loginPageResponse.text();
    const csrfMatch = loginPageHtml.match(/name=['""]csrfmiddlewaretoken['""] value=['""]([^'"]*)['"]/);
    
    if (!csrfMatch) {
      return res.status(400).json({ success: false, message: 'Could not extract CSRF token' });
    }
    
    const csrfToken = csrfMatch[1];
    const initialCookies = loginPageResponse.headers.get('set-cookie') || '';
    
    // Perform login
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    const loginResponse = await fetch('https://www.screener.in/login/', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies,
        'Referer': 'https://www.screener.in/login/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      redirect: 'manual',
    });
    
    const finalUrl = loginResponse.headers.get('location') || loginResponse.url;
    const setCookies = loginResponse.headers.get('set-cookie') || '';
    
    // Check if login was successful (redirect to home page)
    if (loginResponse.status === 302 && !finalUrl.includes('/login/')) {
      // Store session for this user
      const sessionId = Date.now().toString();
      userSessions.set(sessionId, setCookies);
      
      res.json({ 
        success: true, 
        sessionId,
        message: 'Login successful' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Fetch screened stocks
router.post('/fetch-stocks', async (req, res) => {
  try {
    const { sessionId, filters } = req.body;
    
    if (!sessionId || !userSessions.has(sessionId)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please login again.' 
      });
    }
    
    const cookies = userSessions.get(sessionId);
    
    // Build filter URL
    const params = new URLSearchParams();
    
    if (filters.marketCap?.min) params.append('market_cap_min', filters.marketCap.min.toString());
    if (filters.marketCap?.max) params.append('market_cap_max', filters.marketCap.max.toString());
    if (filters.peRatio?.min) params.append('pe_min', filters.peRatio.min.toString());
    if (filters.peRatio?.max) params.append('pe_max', filters.peRatio.max.toString());
    if (filters.roe?.min) params.append('roe_min', filters.roe.min.toString());
    if (filters.debtToEquity?.max) params.append('debt_to_equity_max', filters.debtToEquity.max.toString());
    if (filters.currentRatio?.min) params.append('current_ratio_min', filters.currentRatio.min.toString());
    if (filters.salesGrowth?.min) params.append('sales_growth_min', filters.salesGrowth.min.toString());
    if (filters.profitGrowth?.min) params.append('profit_growth_min', filters.profitGrowth.min.toString());
    
    const screenerUrl = `https://www.screener.in/screen/raw/?${params.toString()}`;
    
    const response = await fetch(screenerUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Screener.in');
    }
    
    const html = await response.text();
    const stocks = parseScreenerResults(html);
    
    res.json({
      success: true,
      data: stocks
    });
    
  } catch (error) {
    console.error('Fetch stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stocks'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && userSessions.has(sessionId)) {
    userSessions.delete(sessionId);
  }
  
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// Helper function to parse screener results
function parseScreenerResults(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const stocks = [];
    const rows = document.querySelectorAll('table tbody tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 8) {
        const nameCell = cells[0].querySelector('a');
        if (nameCell) {
          stocks.push({
            name: nameCell.textContent.trim(),
            ticker: extractTicker(nameCell.getAttribute('href')),
            currentPrice: parseNumber(cells[1].textContent),
            marketCap: parseNumber(cells[2].textContent),
            peRatio: parseNumber(cells[3].textContent),
            roe: parseNumber(cells[4].textContent),
            debtToEquity: parseNumber(cells[5].textContent),
            currentRatio: parseNumber(cells[6]?.textContent || '0'),
            salesGrowth: parseNumber(cells[7]?.textContent || '0'),
            profitGrowth: parseNumber(cells[8]?.textContent || '0'),
            sector: cells[9]?.textContent?.trim() || 'Unknown',
            url: `https://www.screener.in${nameCell.getAttribute('href')}`,
          });
        }
      }
    });
    
    return stocks;
  } catch (error) {
    console.error('Failed to parse screener results:', error);
    return [];
  }
}

function extractTicker(href) {
  const match = href.match(/\/company\/([^\/]+)\//);
  return match ? match[1].toUpperCase() : '';
}

function parseNumber(text) {
  const cleaned = text.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export default router;
