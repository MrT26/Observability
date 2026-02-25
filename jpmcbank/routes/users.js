var express = require('express');
var app = express.Router();
var Customer = require('../models/customers');
var Transaction = require('../models/transaction');
const bcrypt = require('bcrypt');
const { isValidObjectId } = require('mongoose');
var nodemailer = require('nodemailer');


//registration of the customer and employee 
//phone number, email, username must be unique
app.post('/registration', async (req, res) => {

  try {
    const uname = req.body.name;
    console.log(uname)
    const usernameExists = await Customer.findOne({ name: uname });
    console.log(usernameExists)
    if (usernameExists) {
      return res.status(400).send({ message: 'Username already in use' });
    }
    const email = req.body.email;
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      return res.status(400).send({ message: 'Email already in use' });
    }
    const mobile = req.body.mobile;
    const mobileExists = await Customer.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).send({ message: 'Mobile number already in use' });
    }

    // Validate branch field if provided
    if (req.body.branch && req.body.branch !== '' && !isValidObjectId(req.body.branch)) {
      return res.status(400).send({ message: 'Invalid branch selected. Please select a valid branch.' });
    }

    else {
      const customer = new Customer(req.body);

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'chitturi.bhaskarasai@gmail.com',
          pass: 'wtaq rxzk mxhq fpva'
        }
      });
      var mailOptions = {
        from: 'chitturi.bhaskarasai@gmail.com',
        to: `${customer.email}`,
        subject: 'Registration successful with Swadesi Bank',
        text: `Hello ${customer.name},\n\nWelcome to Swadesi Bank. Your account has been created successfully. Your account details are as follows:\n\nName: ${customer.name}\nEmail: ${customer.email}\nMobile: ${customer.mobile}\n Password:${customer.password}\nThank you for choosing Swadesi Bank.`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });


      await customer.save();
      res.status(201).send({ message: 'Registration successful' });
    }
  }
  catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).send({ message: messages.join(', ') });
    }
    res.status(500).send({ message: 'Server error' });
  }
});


//login of the customer and employee 
//returning the role of the user and the id of the user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Step 1: Find the customer by email
    const user = await Customer.findOne({ email });
    console.log(email)
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Step 2: Validate the password
    if (! await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    // Step 3: Redirect based on role
    else if (user.role === 'employee') {
      console.log(user.role);
      return res.status(200).send({ message: 'Login successful', role: 'employee', employeeId: user._id, employeeName: user.name });

    } else if (user.role === 'customer') {
      return res.status(200).send({ message: 'Login successful', role: 'customer', customerId: user._id, customerName: user.name });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

//update the details of the customer
app.put('/customer/:id', async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id);

  if (!customer) {
    return res.status(404).send({ message: 'Customer not found' });
  }
  customer.set(req.body);
  await customer.save();
  res.status(200).send(customer);
});

//change the password of the customer
app.put('/changePassword/:id', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).send({ message: 'Customer not found' });
  }

  if (! await bcrypt.compare(oldPassword, customer.password)) {
    return res.status(401).send({ message: 'Invalid password' });
  }

  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(newPassword, salt);
  await customer.save();
  res.status(200).send({ message: 'Password changed successfully' });
});


//get the details of the customer by id
app.get('/customer/:id', async (req, res) => {

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).send({ message: 'Customer not found' });
  }
  res.status(200).send(customer);

});

app.get('/customerbyName/:name', async (req, res) => {

  const customer = await Customer.findOne({ name: req.params.name });
  if (!customer) {
    return res.status(200).send({ message: 'Customer not found', user: null });
  }
  res.status(200).send({ message: 'Customer found', user: customer });
})

//retrieve all customers
app.get('/allcustomers', async (req, res) => {
  const customers = await Customer.find({ role: 'customer' });
  res.status(200).send(customers);
});

//transaction between the customers
app.post('/transaction', async (req, res) => {
  var { senderId, receiverId, amount, password } = req.body;
  console.log(req.body)
  try {
    // Step 1: Find sender and receiver
    const sender = await Customer.findOne({ _id: senderId });
    const receiver = await Customer.findOne({ _id: receiverId });
    // console.log(sender)
    // console.log(receiver)
    amount = parseInt(amount);
    if (!sender || !receiver) {
      return res.status(404).send({ message: 'Sender or receiver not found' });
    }
    if (! await bcrypt.compare(password, sender.password)) {
      return res.status(401).send({ message: 'Invalid password' });
    }
    if (sender.availableBalance < amount) {
      return res.status(400).send({ message: 'Insufficient balance' });
    }

    sender.availableBalance -= amount;
    receiver.availableBalance += amount;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chitturi.bhaskarasai@gmail.com',
        pass: 'wtaq rxzk mxhq fpva'
      }
    });

    var mailOptions = {
      from: 'chitturi.bhaskarasai@gmail.com',
      to: `${sender.email}`,
      subject: 'Registration successful with Swadesi Bank',
      text: `Hello ${sender.name},\n\nWelcome to Swadesi Bank. Your Transaction with ${receiver.name} is successful. Your Available Balance:${sender.availableBalance}\nThank you for choosing Swadesi Bank.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });


    await sender.save();
    await receiver.save();
    const transaction = new Transaction({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount
    });
    await transaction.save();


    res.status(200).send({ message: 'Transaction successful', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

//get spendings of the customer
app.get('/spendings/:id', async (req, res) => {
  const transactions = await Transaction.find({ senderId: req.params.id });
  res.status(200).send(transactions);
});

//get earnings of the customer
app.get('/earnings/:id', async (req, res) => {
  const transactions = await Transaction.find({ receiverId: req.params.id });
  res.status(200).send(transactions);
});

app.get('/transactions', async (req, res) => {
  const transactions = await Transaction.find();
  res.status(200).send(transactions);
})


module.exports = app;
