const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'preparing', 'served'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);