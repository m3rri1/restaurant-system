const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
  const items = await MenuItem.find({ available: true });
  res.json(items);
});

// Add menu item (admin)
router.post('/add', async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.json({ message: 'Menu item added', item });
});

// Toggle availability
router.put('/toggle/:id', async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  item.available = !item.available;
  await item.save();
  res.json(item);
});

module.exports = router;