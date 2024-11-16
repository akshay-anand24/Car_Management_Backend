const express = require('express');
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create car
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, tags, images } = req.body;
  const car = new Car({
    user: req.user._id,
    title,
    description,
    tags,
    images,
  });

  try {
    if(car.images.length>10)
     return res.status(400).json({msg:"more than 10 images not allowed"})

    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(400).send({msg:err.message});
  }
});

// Get all cars of the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  const cars = await Car.find({ user: req.user._id });
  res.json(cars);
});


// Search cars
router.get('/search', authMiddleware, async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).send({msg:'Search query is required'});
  }

  try {
    const cars = await Car.find({
      // user: req.user._id,
      $or: [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
        { description: { $regex: search, $options: 'i' } }, // Case-insensitive search in description
        { tags: { $regex: search, $options: 'i' } }, // Case-insensitive search in tags
      ],
    });

    res.json(cars);
  } catch (err) {
    res.status(500).send({msg:'Server Error'});
  }
});




// Get car details
router.get('/:id', authMiddleware, async (req, res) => {

  const car = await Car.findById(req.params.id);
  if (!car || car.user.toString() !== req.user._id) {
    return res.status(404).send({msg:'Car not found'});
  }
  res.json(car);
});

// Update car
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, tags, images } = req.body;
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.user._id) {
      return res.status(404).send({msg:'Car not found'});
    }
console.log(req.user)
    car.title = title || car.title;
    car.description = description || car.description;
    car.tags = tags || car.tags;
    car.images = images || car.images;

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (err) {
    res.status(400).send({msg:err.message});
  }
});

// Delete car
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.user._id) {
      return res.status(404).send({msg:'Car not found'});
    }
    await Car.deleteOne({_id:car._id});
    res.send({msg:'Car deleted'});
  } catch (err) {
    res.status(400).send({msg:err.message});
  }
});



module.exports = router;
