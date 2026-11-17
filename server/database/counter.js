'use strict';

const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  _id: String,
  value: { type: Number, default: 0 }
});
module.exports = mongoose.model('Counter', schema);
