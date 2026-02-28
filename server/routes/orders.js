const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place new order
router.post('/place', async (req, res) => {
  const { tableNumber, items } = req.body;
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const order = new Order({ tableNumber, items, totalPrice });
  await order.save();

  // Real-time notify kitchen/waiter
  const io = req.app.get('io');
  io.emit('new-order', order);

  res.json({ message: 'Order placed', order });
});

// Get orders for a table
router.get('/table/:tableNumber', async (req, res) => {
  const orders = await Order.find({ tableNumber: req.params.tableNumber });
  res.json(orders);
});

// Get ALL orders (waiter/admin view)
router.get('/all', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Update order status
router.put('/status/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  const io = req.app.get('io');
  io.emit('order-updated', order);
  res.json(order);
});

module.exports = router;