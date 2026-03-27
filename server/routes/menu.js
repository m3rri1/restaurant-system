const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { upload, cloudinary } = require('../config/cloudinary');

// Get ALL items so the customer app can show the "Sold Out" badge
router.get('/', async (req, res) => {
  const items = await MenuItem.find(); // Filter removed!
  res.json(items);
});

// Get ALL items (admin)
router.get('/all', async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

// Add item WITH image
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const item = new MenuItem({
      name: req.body.name,
      category: req.body.category,
      price: parseInt(req.body.price),
      description: req.body.description,
      image: req.file ? req.file.path : ''
    });
    await item.save();
    res.json({ message: 'Menu item added', item });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Toggle availability
router.put('/toggle/:id', async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  item.available = !item.available;
  await item.save();
  res.json(item);
});

// Delete item
router.delete('/delete/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    // Delete from Cloudinary if has image
    if (item.image) {
      const parts = item.image.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `restaurant-menu/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;