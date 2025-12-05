# Quick Start Guide

## Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check if MongoDB is installed
mongod --version

# Check npm
npm --version
```

## Step 1: Install MongoDB (if not installed)

### Windows:
Download from: https://www.mongodb.com/try/download/community

### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### Linux:
```bash
sudo apt-get install mongodb
```

## Step 2: Start MongoDB
```bash
# Start MongoDB service
mongod

# Or if installed as service:
# Windows: Services → MongoDB → Start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

## Step 3: Setup Backend

```bash
# Navigate to backend
cd c:\Users\prash\Desktop\repos\stock-insights\backend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Edit .env and set:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/stock-insights
# NODE_ENV=development

# Start backend server
npm run dev
```

Backend should now be running on http://localhost:5000

## Step 4: Setup Frontend

```bash
# Open new terminal
# Navigate to frontend
cd c:\Users\prash\Desktop\repos\stock-insights\frontend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Edit .env and set:
# VITE_API_URL=http://localhost:5000/api

# Start frontend server
npm run dev
```

Frontend should now be running on http://localhost:4321

## Step 5: Test the Application

1. Open browser: http://localhost:4321
2. Navigate to "Fundamentals" page
3. Click "Add Stock" button
4. Fill in stock details:
   - Stock Name: Reliance Industries
   - Ticker: RELIANCE
   - Price: 2450
   - Market Cap: 165000
   - P/E Ratio: 25.3
   - ROE: 15.2
   - Debt/Equity: 0.45
   - Industry: Energy
5. Click "Add Stock"
6. Stock should appear in the table
7. Navigate to "Portfolio" page to see charts

## Step 6: Verify API

```bash
# Test health check
curl http://localhost:5000/api/health

# Test get all stocks
curl http://localhost:5000/api/stocks

# Test create stock
curl -X POST http://localhost:5000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{
    "stockName": "TCS",
    "tickerSymbol": "TCS",
    "currentPrice": 3500,
    "marketCap": 125000,
    "peRatio": 28,
    "roe": 42,
    "industry": "IT"
  }'
```

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongod --version`
- Check port 5000 is not in use
- Verify .env file exists with correct values

### Frontend won't start
- Check if backend is running
- Verify .env file has correct API URL
- Try clearing node_modules: `rm -rf node_modules && npm install`

### Database connection error
- Ensure MongoDB service is started
- Check MONGODB_URI in backend/.env
- Default should be: `mongodb://localhost:27017/stock-insights`

### API calls failing
- Check VITE_API_URL in frontend/.env
- Open browser console (F12) to see errors
- Verify backend is running on correct port
- Check CORS is enabled in backend

## Development Workflow

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server runs with nodemon (auto-restart on changes)
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm run dev
# Vite dev server with HMR (hot module reload)
```

### Terminal 3 - MongoDB
```bash
mongod
# Keep MongoDB running
```

## What's Next?

1. **Add More Stocks**: Use the "Add Stock" button in Fundamentals page
2. **View Dashboard**: Check Portfolio page for visualizations
3. **Customize**: Modify components in `frontend/src/components/`
4. **Add Features**: Extend API in `backend/src/routes/`
5. **Deploy**: Follow deployment guide in main README.md

## Getting Help

- Check logs in terminal where backend/frontend are running
- Open browser console (F12) for frontend errors
- Review API responses using browser Network tab
- Refer to main README.md for detailed documentation

## Stop Servers

```bash
# In each terminal, press:
Ctrl + C

# Stop MongoDB (if running as service):
# Windows: Services → MongoDB → Stop
# Mac: brew services stop mongodb-community
# Linux: sudo systemctl stop mongod
```

---

Happy Coding! 🚀
