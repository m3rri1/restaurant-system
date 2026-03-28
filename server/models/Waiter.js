const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const waiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  assignedTables: [Number],
  isAvailable: { type: Boolean, default: true }
});

waiterSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

module.exports = mongoose.model('Waiter', waiterSchema);