'use strict';

const express = require('express');
const Dealerships = require('./dealership');
const Reviews = require('./review');
const Counter = require('./counter');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  const route = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
  const projection = { _id: 0, __v: 0 };

  app.get('/', (req, res) => {
    res.json({ service: 'Dealer and Review API', storage: 'MongoDB' });
  });
  app.get('/health', route(async (req, res) => {
    const mongoose = require('mongoose');
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', storage: 'MongoDB' });
  }));
  app.get('/fetchDealers', route(async (req, res) => {
    res.json(await Dealerships.find({}, projection).sort({ id: 1 }).lean());
  }));
  app.get('/fetchDealers/:state', route(async (req, res) => {
    const state = req.params.state;
    const escaped = state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = state.toLowerCase() === 'all' ? {} : {
      state: { $regex: '^' + escaped + '$', $options: 'i' }
    };
    res.json(await Dealerships.find(filter, projection).sort({ id: 1 }).lean());
  }));
  app.get('/fetchDealer/:id', route(async (req, res) => {
    const dealer = await Dealerships.find(
      { id: Number(req.params.id) }, projection
    ).lean();
    if (!dealer.length) {
      return res.status(404).json({ error: 'Dealer not found' });
    }
    res.json(dealer);
  }));
  app.get('/fetchReviews', route(async (req, res) => {
    res.json(await Reviews.find({}, projection).sort({ id: 1 }).lean());
  }));
  app.get('/fetchReviews/dealer/:id', route(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid dealer ID' });
    }
    res.json(await Reviews.find({ dealership: id }, projection)
      .sort({ id: -1 }).lean());
  }));
  app.post('/insert_review', route(async (req, res) => {
    const data = req.body;
    if (!data || typeof data.review !== 'string' || !data.review.trim() ||
        typeof data.name !== 'string' || !data.name.trim() ||
        typeof data.purchase !== 'boolean' ||
        !Number.isSafeInteger(data.dealership) || data.dealership < 1) {
      return res.status(400).json({ error: 'Invalid review fields' });
    }
    if (data.purchase && (!data.purchase_date || !data.car_make ||
        !data.car_model || !Number.isInteger(data.car_year) ||
        data.car_year < 1900 || data.car_year > new Date().getFullYear() + 1)) {
      return res.status(400).json({ error: 'Complete the purchase details' });
    }
    if (!await Dealerships.exists({ id: data.dealership })) {
      return res.status(404).json({ error: 'Dealer not found' });
    }
    const counter = await Counter.findOneAndUpdate(
      { _id: 'review' }, { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    const document = await Reviews.create({
      id: counter.value,
      name: data.name.trim(),
      dealership: data.dealership,
      review: data.review.trim(),
      purchase: data.purchase,
      purchase_date: data.purchase_date || '',
      car_make: data.car_make || '',
      car_model: data.car_model || '',
      car_year: data.car_year || null,
      sentiment: data.sentiment || 'neutral'
    });
    const review = document.toObject();
    delete review._id;
    delete review.__v;
    res.status(201).json(review);
  }));
  app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    const badRequest = err.name === 'ValidationError' ||
      err.name === 'CastError' || err.type === 'entity.parse.failed';
    console.error(err.message);
    res.status(badRequest ? 400 : 503).json({
      error: badRequest ? 'Invalid request data' : 'Database unavailable'
    });
  });
  return app;
}

module.exports = { createApp };
