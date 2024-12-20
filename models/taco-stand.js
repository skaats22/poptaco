const mongoose = require("mongoose");
//Shortcut variable
const Schema = mongoose.Schema;

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
  hours: {
    type: String,
    required: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model("TacoStand", tacoStandSchema);