const express = require('express');
const router = express.Router();
const Waiter = require('../models/Waiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create waiter (admin only)
router.post('/create', async (req, res) => {
  try {
    const waiter = new Waiter(req.body);
    await waiter.save();
    res.json({ message: 'Waiter created' });
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

// Login
// Login
router.post('/login', async (req, res) => {
  try {
    const waiter = await Waiter.findOne({ username: req.body.username });
    if (!waiter) return res.status(404).json({ error: 'Username not found' });
    const valid = await bcrypt.compare(req.body.password, waiter.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    const token = jwt.sign(
      { id: waiter._id, name: waiter.name, assignedTables: waiter.assignedTables },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({
      token,
      waiter: {
        id: waiter._id,
        name: waiter.name,
        username: waiter.username,
        assignedTables: waiter.assignedTables,
        isAvailable: waiter.isAvailable
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all waiters (admin)
router.get('/all', async (req, res) => {
  const waiters = await Waiter.find().select('-password');
  res.json(waiters);
});

// Update assigned tables
router.put('/tables/:id', async (req, res) => {
  const waiter = await Waiter.findByIdAndUpdate(
    req.params.id,
    { assignedTables: req.body.assignedTables },
    { new: true }
  ).select('-password');
  res.json(waiter);
});

// Toggle availability
router.put('/availability/:id', async (req, res) => {
  const waiter = await Waiter.findByIdAndUpdate(
    req.params.id,
    { isAvailable: req.body.isAvailable },
    { new: true }
  ).select('-password');
  res.json(waiter);
});

// Delete waiter
router.delete('/delete/:id', async (req, res) => {
  await Waiter.findByIdAndDelete(req.params.id);
  res.json({ message: 'Waiter deleted' });
});

module.exports = router;