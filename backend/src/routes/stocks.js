import express from 'express';
import Stock from '../models/Stock.js';

const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ stockName: 1 });
    res.json({ success: true, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single stock by ID
router.get('/:id', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new stock
router.post('/', async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json({ success: true, data: stock });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update stock
router.put('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete stock
router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    res.json({ success: true, message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
