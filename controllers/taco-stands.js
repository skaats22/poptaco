const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand');

// Middleware to protect seleceted routes
const ensureSignedIn =  require('../middleware/ensure-signed-in');

// All routes start with '/taco-stands'

// GET /stands (index functionality) UNPROTECTED - all users can access
router.get('/', async (req, res) => {
  const stands = await TacoStand.find({}).populate('owner');
  res.render('taco-stands/home.ejs', {
    title: "All Taco Stands",
    stands,
  });
});

// GET /taco-stands/new (new functionality) PROTECTED - only signed in users
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('taco-stands/new.ejs', {
    title: 'Add New Taco Stand',
  })
});

// GET /taco-stands/:tId (show functionality)
router.get('/:sId', async (req, res) => {
  const stand = await TacoStand.findById(req.params.sId).populate('owner');
  res.render('taco-stands/show.ejs', {
    title: `${stand.name} in ${stand.city}`,
    stand,
  })
});

// POST /taco-stands (create functionality) PROTECTED
router.post('/', ensureSignedIn, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    await TacoStand.create(req.body);
    res.redirect('/taco-stands')
  } catch (e) {
    res.redirect('/listings/new');
  }
});

module.exports = router;