const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({ username, email, password: hashedPassword });
  try {
    await user.save();
    res.status(201).send({msg:'User registered'});
  } catch (err) {
    res.status(400).send({msg:err.message});
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send({msg:'Invalid email or password'});

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send({msg:'Invalid email or password'});

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('Authorization', token).send({ token });
});

module.exports = router;
