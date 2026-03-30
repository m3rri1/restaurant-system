const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// Get all tables
router.get('/', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

// Add a table
router.post('/add', async (req, res) => {
  const table = new Table({ tableNumber: req.body.tableNumber });
  await table.save();
  res.json({ message: 'Table added', table });
});

router.post('/clear/:tableNumber', async (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber);

    // Mark all orders as cleared
    await Order.updateMany(
      { tableNumber },
      { cleared: true, status: 'served' }
    );

    // Mark all requests as done
    await Request.updateMany(
      { tableNumber },
      { status: 'done' }
    );

    // Set table to empty
    await Table.findOneAndUpdate(
      { tableNumber },
      { status: 'empty' }
    );

    const io = req.app.get('io');
    io.emit('table-cleared', { tableNumber });

    res.json({ message: 'Table cleared successfully' });
  } catch(e) {
    console.log('Clear table error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Update table status
router.put('/status/:tableNumber', async (req, res) => {
  const table = await Table.findOneAndUpdate(
    { tableNumber: req.params.tableNumber },
    { status: req.body.status },
    { new: true }
  );
  res.json(table);
});

module.exports = router;