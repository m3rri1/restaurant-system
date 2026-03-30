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

// Clear Table Route
router.post('/clear/:tableNumber', async (req, res) => {
  try {
    const tableNum = parseInt(req.params.tableNumber);
    
    // 1. Reset the table status to empty
    await Table.findOneAndUpdate({ tableNumber: tableNum }, { status: 'empty' });
    
    // 2. Clear out the orders and requests for this table
    await Order.updateMany({ tableNumber: tableNum }, { status: 'paid' });
    await Request.updateMany({ tableNumber: tableNum }, { status: 'done' });
    await Complaint.updateMany({ tableNumber: tableNum }, { status: 'resolved' });

    // 3. THIS IS THE CRITICAL LINE: Tell the customer's phone to reset!
    const io = req.app.get('io');
    if (io) {
      io.emit('table-cleared', { tableNumber: tableNum });
      io.emit('order-updated'); // Tell admin/waiters to refresh their screens
    }

    res.json({ success: true, message: 'Table cleared' });
  } catch (error) {
    console.error("Clear table error:", error);
    res.status(500).json({ error: error.message });
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