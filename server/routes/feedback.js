const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit feedback
router.post('/submit', async (req, res) => {
  const feedback = new Feedback(req.body);
  await feedback.save();
  res.json({ message: 'Feedback submitted', feedback });
});

// Get all feedback (admin)
router.get('/all', async (req, res) => {
  const feedback = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedback);
});

module.exports = router;