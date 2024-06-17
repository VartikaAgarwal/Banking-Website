
const express = require('express');
const mongoose = require('mongoose');
const Customer = require('./models/customer'); // Make sure this path is correct
const Transfer = require('./models/transfer'); // Make sure this path is correct

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

mongoose.connect('your-mongodb-connection-string', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.json(customer);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/transfer', async (req, res) => {
    const { fromCustomerId, toCustomerId, amount } = req.body;

    try {
        const fromCustomer = await Customer.findById(fromCustomerId);
        const toCustomer = await Customer.findById(toCustomerId);

        if (!fromCustomer || !toCustomer) {
            return res.status(404).send('Customer not found');
        }

        if (fromCustomer.balance < amount) {
            return res.status(400).send('Insufficient balance');
        }

        fromCustomer.balance -= amount;
        toCustomer.balance += amount;

        await fromCustomer.save();
        await toCustomer.save();

        const transfer = new Transfer({
            fromCustomerId,
            toCustomerId,
            amount,
            date: new Date()
        });

        await transfer.save();

        res.status(200).send('Transfer successful');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
