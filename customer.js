const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
