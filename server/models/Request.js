const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  type: { type: String, required: true }, // "Call Waiter", "Water", "Bill" etc.
  status: { type: String, enum: ['pending', 'accepted', 'done'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);