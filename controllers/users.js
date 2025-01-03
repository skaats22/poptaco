const express = require('express');
const router = express.Router();
const TacoStand = require('../models/taco-stand.js');
const User = require('../models/user.js');
// Middleware to protect seleceted routes
const ensureSignedIn =  require('../middleware/ensure-signed-in.js');

// All routes start with'/users'

// GET /users (index functionality)
router.get('/', ensureSignedIn, async (req, res) => {
  // req.user is the signed in user's document (userSchema object)
  const users = await User.find();
  res.render('users/home.ejs',
    {
      title: 'Our Community',
      users,
    }
  );
});

// GET /users/:id (show functionality)
router.get('/:sId', ensureSignedIn, async (req, res) => {
  const currentUser = await User.findById(req.params.sId);
  const stands = await TacoStand.find({}).populate('name');
  res.render('users/show.ejs', 
    {
      title: `${currentUser.username}'s Taco Stands`, 
      user: currentUser,
      stands,
    }
  );
});


module.exports = router;