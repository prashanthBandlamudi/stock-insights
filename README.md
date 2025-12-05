# Stock Insights

A modern stock analysis platform with frontend and backend separation. Track stocks, analyze fundamentals, and manage your portfolio with ease.

## 📁 Project Structure

```
stock-insights/
├── frontend/          # React + Astro frontend application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── styles/       # Global styles
│   └── public/           # Static assets
│
├── backend/           # Express.js REST API
│   └── src/
│       ├── models/       # MongoDB models
│       ├── routes/       # API routes
│       └── index.js      # Server entry point
│
└── README.md
```

## 🚀 Features

- **Fundamental Screening**: Analyze stocks with key financial metrics
- **Portfolio Dashboard**: Track holdings and performance
- **Interactive Charts**: Visualize data with sector allocation and trends
- **RESTful API**: Clean separation between frontend and backend
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion

## 🛠️ Technology Stack

### Frontend
- **Framework**: Astro 5.8.0 + React 18.3.0
- **Styling**: Tailwind CSS 3.4.14
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Language**: TypeScript 5.8.3

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.0
- **Language**: JavaScript (ES Modules)

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-insights
NODE_ENV=development
```

5. Start the server:
```bash
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and configure:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:4321`

## 🔌 API Endpoints

### Stocks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | Get all stocks |
| GET | `/api/stocks/:id` | Get stock by ID |
| POST | `/api/stocks` | Create new stock |
| PUT | `/api/stocks/:id` | Update stock |
| DELETE | `/api/stocks/:id` | Delete stock |

### Example Request

```bash
# Get all stocks
curl http://localhost:5000/api/stocks

# Create a new stock
curl -X POST http://localhost:5000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{
    "stockName": "Reliance Industries",
    "tickerSymbol": "RELIANCE",
    "currentPrice": 2450.50,
    "marketCap": 165000,
    "peRatio": 25.3,
    "roe": 15.2,
    "debtToEquity": 0.45,
    "industry": "Energy"
  }'
```

## 📊 Data Model

### Stock Schema

```javascript
{
  stockName: String (required),
  tickerSymbol: String (required, unique),
  marketCap: Number,
  peRatio: Number,
  roe: Number,
  debtToEquity: Number,
  currentPrice: Number,
  industry: String,
  dataDate: Date (default: now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🎨 Frontend Pages

- **Home** (`/`) - Landing page with feature overview
- **Fundamentals** (`/fundamentals`) - Stock screening and analysis
- **Portfolio** (`/portfolio`) - Portfolio dashboard with charts

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
```

## 📝 Key Changes from Original

### Removed Features
- ✂️ Wix authentication and member management
- ✂️ Subscription tiers and payment integration
- ✂️ Member-protected routes
- ✂️ Sign-in/Sign-up components

### New Architecture
- ✅ Separated frontend and backend into distinct folders
- ✅ RESTful API with Express.js
- ✅ MongoDB for data persistence
- ✅ Simplified authentication-free access
- ✅ Clean service layer for API calls

## 🚢 Deployment

### Frontend
Can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

### Backend
Can be deployed to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

Make sure to update environment variables for production deployment.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@stockinsights.com or open an issue in the repository.
