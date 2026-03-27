const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      specialRequest: { type: String, default: '' }
    }
  ],
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'preparing', 'served'], default: 'pending' },
  placedAt: { type: Date, default: Date.now },
  modifiable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);