const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand');
const User = require('../models/user');

// Middleware to protect seleceted routes
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Function for adding emojis based on rating
function ratingEmojis(count, emoji) {
  return emoji.repeat(count);
}

// All routes start with '/taco-stands'

// GET /stands (index functionality) UNPROTECTED - all users can access
router.get('/', async (req, res) => {
  const stands = await TacoStand.find({}).populate('owner');
  stands.forEach((stand) => {
    if (stand.reviews.length > 0) {
      const sum = stand.reviews.reduce((acc, review) => acc + review.rating, 0);
      stand.averageRating = (sum / stand.reviews.length)
    } else {
      stand.averageRating = "No ratings yet";
    }
    stand.numberOfRatings = stand.reviews.length;
  });
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
  let avgRating = [];
  currentStand.reviews.forEach((review) => {
    avgRating.push(review.rating)
  });
  const sum = avgRating.reduce((acc, num) => acc + num, 0);
  const average2 = sum / avgRating.length;
  const average = (Math.round(average2 * 100) /100);
  const emoji = '🌮';
  const ratingD = ratingEmojis(average, emoji);
  res.render('taco-stands/show.ejs', {
    title: `${currentStand.name}`,
    currentStand,
    ratingD,
    user,
    avgRating,
    average,
    createdAt: currentStand.createdAt,
    updatedAt: currentStand.updatedAt,
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

// GET /taco-stands/:sId/reviews/edit (edit review functionality) PROTECTED
router.get('/:sId/reviews/edit', ensureSignedIn, async (req, res) => {
  const stand = await TacoStand.findById(req.params.sId);
  const currentUser = req.user;
  res.render('reviews/edit.ejs', {
    title: `Edit Review for ${stand.name}`,
    stand,
    currentUser,
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
    req.body.hour = [req.body.hourFrom, req.body.fromPeriod, req.body.hourTo, req.body.toPeriod];
    await stand.updateOne(req.body);
    await stand.save();
    res.redirect(`/taco-stands/${req.params.sId}`)
  } catch (e) {
    console.log(e);
    res.redirect('/');
  }
});

// PUT /taco-stands/:sId/reviews (update review functionality) PROTECTED
router.put('/:sId/reviews', ensureSignedIn, async (req, res) => {
  try {
    // Find current taco stand
    const stand = await TacoStand.findById(req.params.sId);
    // Find current review id
    const review = stand.reviews.id(req.body.reviewId);
    if (req.body.rating) {
      review.rating = req.body.rating;
    }
    if (req.body.comment) {
      review.comment = req.body.comment;
    }
    await stand.save();
    res.redirect(`/taco-stands/${req.params.sId}`)
  } catch (e) {
    console.log(e);
    res.redirect('/');
  }
});

// POST /taco-stands (create functionality) PROTECTED
router.post('/', ensureSignedIn, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    req.body.rating = 0;
    if (req.body.day) {
      req.body.day = Array.isArray(req.body.day) ? req.body.day : [req.body.day];
    }
    req.body.hour = [req.body.hourFrom, req.body.fromPeriod, req.body.hourTo, req.body.toPeriod];
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

// DELETE /taco-stands/:sId/reviews (delete review functionality) PROTECTED
router.delete('/:sId/reviews', ensureSignedIn, async (req, res) => {
  const stand = await TacoStand.findById(req.params.sId);
  // Find current review id
  const review = stand.reviews.id(req.body.reviewId);
  stand.reviews.pull(review);
  await stand.save();
  res.redirect(`/taco-stands/${req.params.sId}`);
});

module.exports = router;