const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  ratings: [
    {
      itemName: String,
      stars: Number  // 1 to 5
    }
  ],
  comment: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);