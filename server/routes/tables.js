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