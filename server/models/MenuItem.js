const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // "Starters", "Main Course", "Drinks" etc.
  price: { type: Number, required: true },
  description: { type: String },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);