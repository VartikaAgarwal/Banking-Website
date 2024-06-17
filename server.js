const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const Customer = require('./models/customer');
const Transfer = require('./models/transfer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');

  const customersCount = await Customer.countDocuments();
  console.log(`Database already has ${customersCount} customers`);
  if (customersCount === 0) {
    console.log('Inserting initial customers data');
    await Customer.insertMany([
      { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', balance: 1000 },
      { name: 'Lalit Verma', email: 'lalit.verma@example.com', balance: 1500 },
      { name: 'Little Verma', email: 'little.verma@example.com', balance: 800 },
      { name: ' Vihaan Kumar', email: 'vihaan.kumar@example.com', balance: 1200 },
      { name: 'Krishna Singh', email: 'krishna.singh@example.com', balance: 1100 },
      { name: 'Aditya Patel', email: 'aditya.patel@example.com', balance: 1300 },
      { name: 'Arjun Gupta', email: 'arjun.gupta@example.com', balance: 900 },
      { name: 'Sai Joshi', email: 'sai.joshi@example.com', balance: 1400 },
      { name: 'Ayaan Das', email: 'ayaan.das@example.com', balance: 800 },
      { name: 'Ishaan Yadav', email: 'ishaan.yadav@example.com', balance: 1000 }
    ]);
    console.log('Inserted initial customers data');
  } else {
    console.log(`Database already has ${customersCount} customers`)
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.render('customers', { customers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});


app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    // Modify balance to prepend ₹ symbol in each customer object
    const customersFormatted = customers.map(customer => ({
      ...customer.toObject(),
      balance: `${customer.balance}`
    }));
    res.json(customersFormatted);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});


app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    // Modify balance to prepend ₹ symbol
    customer.balance = `${customer.balance}`;
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});


app.post('/api/transfer', async (req, res) => {
    const { fromCustomerId, toCustomerId, amount } = req.body;
  
    const fromCustomer = await Customer.findById(fromCustomerId);
    const toCustomer = await Customer.findById(toCustomerId);
  
    const transferAmount = Number(amount); // Ensure the amount is treated as a number
  
    if (fromCustomer && toCustomer && fromCustomer.balance >= transferAmount) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        fromCustomer.balance -= transferAmount;
        toCustomer.balance += transferAmount;
  
        await fromCustomer.save({ session });
        await toCustomer.save({ session });
  
        await Transfer.create(
          [{ amount: transferAmount, fromCustomerId, toCustomerId }],
          { session }
        );
  
        await session.commitTransaction();
        session.endSession();
  
        res.sendStatus(200);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).send('Something went wrong');
      }
    } else {
      res.status(400).send('Invalid transfer request');
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
