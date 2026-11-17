'use strict';

const fs = require('fs');
const path = require('path');
const Dealerships = require('./dealership');
const Reviews = require('./review');
const Counter = require('./counter');

async function seed() {
  const dealers = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'data', 'dealerships.json'), 'utf8'
  )).dealerships;
  const reviews = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'data', 'reviews.json'), 'utf8'
  )).reviews;
  await Promise.all([Dealerships.init(), Reviews.init(), Counter.init()]);
  // Insert missing template records without deleting or overwriting reviews.
  await Dealerships.bulkWrite(dealers.map((dealer) => ({
    updateOne: {
      filter: { id: dealer.id }, update: { $setOnInsert: dealer }, upsert: true
    }
  })));
  await Reviews.bulkWrite(reviews.map((review) => ({
    updateOne: {
      filter: { id: review.id }, update: { $setOnInsert: review }, upsert: true
    }
  })));
  const latest = await Reviews.findOne().sort({ id: -1 }).lean();
  await Counter.updateOne(
    { _id: 'review' }, { $max: { value: latest ? latest.id : 0 } },
    { upsert: true }
  );
  console.log('MongoDB seed ready: ' + await Dealerships.countDocuments() +
    ' dealers, ' + await Reviews.countDocuments() + ' reviews');
}

module.exports = { seed };
