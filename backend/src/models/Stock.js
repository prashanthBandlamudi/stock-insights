import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  stockName: {
    type: String,
    required: true,
    trim: true
  },
  tickerSymbol: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  marketCap: {
    type: Number
  },
  peRatio: {
    type: Number
  },
  roe: {
    type: Number
  },
  debtToEquity: {
    type: Number
  },
  currentPrice: {
    type: Number
  },
  industry: {
    type: String,
    trim: true
  },
  dataDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Stock', stockSchema);
