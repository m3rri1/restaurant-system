const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Submit complaint
router.post('/submit', async (req, res) => {
  const complaint = new Complaint(req.body);
  await complaint.save();

  const io = req.app.get('io');
  io.emit('new-complaint', complaint);

  res.json({ message: 'Complaint submitted', complaint });
});

// Get all complaints (admin/manager)
router.get('/all', async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 });
  res.json(complaints);
});

// Mark as resolved
router.put('/status/:id', async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(complaint);
});

module.exports = router;