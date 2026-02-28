const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// Create request (waiter, tissue, cutlery etc.)
router.post('/new', async (req, res) => {
  const request = new Request(req.body);
  await request.save();

  const io = req.app.get('io');
  io.emit('new-request', request);

  res.json({ message: 'Request sent', request });
});

// Get all pending requests (waiter view)
router.get('/all', async (req, res) => {
  const requests = await Request.find().sort({ createdAt: -1 });
  res.json(requests);
});

// Update request status
router.put('/status/:id', async (req, res) => {
  const request = await Request.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  const io = req.app.get('io');
  io.emit('request-updated', request);
  res.json(request);
});

module.exports = router;