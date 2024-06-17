const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  fromCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  toCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
