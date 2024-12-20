const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand');

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
  const stand = await TacoStand.findById(req.params.sId).populate('owner');
  const rating = stand.rating;
  const emoji = '🌮';
  const ratingD = ratingEmojis(rating, emoji);
  res.render('taco-stands/show.ejs', {
    title: `${stand.name}`,
    stand,
    ratingD
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

// GET /taco-stands/:sId/comments (index comments functionality)
router.get('/:sId/reviews', (req, res) => {
  res.render('taco-stands/show.ejs', {

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
    res.redirect('/listings/new');
  }
});

// DELETE /taco-stands/:sId (delete functionality) PROTECTED
router.delete('/:sId', ensureSignedIn, async (req, res) => {
  await TacoStand.findByIdAndDelete(req.params.sId);
  await req.user.save();
  res.redirect('/taco-stands');
});

module.exports = router;