const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  message: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['new', 'seen', 'resolved'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);