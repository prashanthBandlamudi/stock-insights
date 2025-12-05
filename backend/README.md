# Stock Insights Backend API

Express.js REST API for stock analysis and portfolio management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure MongoDB connection in `.env`

4. Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

## API Endpoints

- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get single stock
- `POST /api/stocks` - Create stock
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

## Health Check

```bash
curl http://localhost:5000/api/health
```
