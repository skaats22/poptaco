const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand');
const User = require('../models/user');

// Middleware to protect seleceted routes
const ensureSignedIn =  require('../middleware/ensure-signed-in');

// Function for adding emojis based on rating
function ratingEmojis (count, emoji) {
  return emoji.repeat(count);
}

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
  });
});

// GET /taco-stands/:sId (show functionality) UNPROTECTED
router.get('/:sId', async (req, res) => {
  const currentStand = await TacoStand.findById(req.params.sId);
  const user = req.user;
  const rating = currentStand.rating;
  const emoji = '🌮';
  const ratingD = ratingEmojis(rating, emoji);
  res.render('taco-stands/show.ejs', {
    title: `${currentStand.name}`,
    currentStand,
    ratingD,
    user,
  })
});

// GET /taco-stands/:sId/edit (edit functionality) PROTECTED
router.get('/:sId/edit', ensureSignedIn, async (req, res) => {
  const stand = await TacoStand.findById(req.params.sId);
  res.render('taco-stands/edit.ejs', {
    title: `Edit ${stand.name}`,
    stand,
  })
});

// GET /taco-stands/:sId/reviews/new (new review functionality)
router.get('/:sId/reviews/new', ensureSignedIn, async (req, res) => {
  const stand = await TacoStand.findById(req.params.sId);
  const currentUser = req.user;
  res.render('reviews/new.ejs', {
    title: `Add a review for ${stand.name}`,
    user: currentUser,
    stand,
  })
});

// PUT /taco-stands/:sId (update functionality) PROTECTED
router.put('/:sId', ensureSignedIn, async (req, res) => {
  try {
    const stand = await TacoStand.findById(req.params.sId);
    await stand.updateOne(req.body);
    await stand.save();
    res.redirect(`/taco-stands`)
  } catch (e) {
    console.log(e);
    res.redirect('/');
  }
});

// POST /taco-stands (create functionality) PROTECTED
router.post('/', ensureSignedIn, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    await TacoStand.create(req.body);
    res.redirect('/taco-stands')
  } catch (e) {
    res.redirect('/taco-stands/new');
  }
});

// POST /taco-stands/:sId/reviews (create review functionality) PROTECTED
router.post('/:sId/reviews', ensureSignedIn, async (req, res) => {
  try {
    const stand = await TacoStand.findById(req.params.sId);
    const newReview = {
      username: req.user.username,
      rating: req.body.rating,
      comment: req.body.comment,
    };
    stand.reviews.push(newReview);
    await stand.save();
    res.redirect(`/taco-stands/${req.params.sId}`)
  } catch (e) {
    res.redirect('/taco-stands');
  }
});

// DELETE /taco-stands/:sId (delete functionality) PROTECTED
router.delete('/:sId', ensureSignedIn, async (req, res) => {
  await TacoStand.findByIdAndDelete(req.params.sId);
  await req.user.save();
  res.redirect('/taco-stands');
});

module.exports = router;