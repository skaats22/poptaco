const mongoose = require("mongoose");
//Shortcut variable
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
  }
);

const tacoStandSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: false,
  },
  day: {
    type: [String],
    required: false,
  },
  hour: {
    type: [String],
    required: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviews: [reviewSchema],
});

module.exports = mongoose.model("TacoStand", tacoStandSchema);