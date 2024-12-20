const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand');

// Middleware to protect seleceted routes
const ensureSignedIn =  require('../middleware/ensure-signed-in');

// All routes start with '/taco-stands'

// GET /stands (index functionality) UNPROTECTED - all users can access
router.get('/', (req, res) => {
  res.render('taco-stands/home.ejs', {
    title: "All Taco Stands",
  });
});

// GET /taco-stands/new (new functionality) PROTECTED - only signed in users can access
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('taco-stands/new', {
    title: 'Add a new Taco Stand',
  })
});



module.exports = router;