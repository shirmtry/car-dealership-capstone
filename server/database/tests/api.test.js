'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { createApp } = require('../api');
const { seed } = require('../seed');
let server;
let base;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const database = 'capstone_test_' + process.pid + '_' + Date.now();

before(async () => {
  await mongoose.connect(uri, { dbName: database, serverSelectionTimeoutMS: 10000 });
  await seed();
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) { await new Promise((resolve) => server.close(resolve)); }
  await mongoose.disconnect();
});

test('real MongoDB returns template fields, Kansas and a dealer by ID', async () => {
  const dealers = await (await fetch(base + '/fetchDealers')).json();
  assert.equal(dealers.length, 50);
  for (const key of ['id', 'full_name', 'city', 'address', 'zip', 'state', 'st', 'lat', 'long']) {
    assert.ok(Object.prototype.hasOwnProperty.call(dealers[0], key));
  }
  const kansas = await (await fetch(base + '/fetchDealers/kansas')).json();
  assert.ok(kansas.length > 0);
  assert.ok(kansas.every((dealer) => dealer.state === 'Kansas' && dealer.st === 'KS'));
  const escaped = await (await fetch(base + '/fetchDealers/.*')).json();
  assert.equal(escaped.length, 0);
  const dealer = await (await fetch(base + '/fetchDealer/15')).json();
  assert.equal(dealer[0].id, 15);
  assert.equal((await fetch(base + '/fetchDealer/99999')).status, 404);
});

test('reviews receive unique IDs and survive reseeding and reconnection', async () => {
  const payload = {
    name: 'Integration Test Buyer', dealership: 15,
    review: 'Fantastic service from the integration test.', purchase: true,
    purchase_date: '2026-11-10', car_make: 'Audi', car_model: 'A6',
    car_year: 2021, sentiment: 'positive'
  };
  const responses = await Promise.all([1, 2].map(() => fetch(base + '/insert_review', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  })));
  assert.ok(responses.every((response) => response.status === 201));
  const saved = await Promise.all(responses.map((response) => response.json()));
  assert.notEqual(saved[0].id, saved[1].id);
  await seed();
  await mongoose.disconnect();
  await mongoose.connect(uri, { dbName: database });
  const reviews = await (await fetch(base + '/fetchReviews/dealer/15')).json();
  for (const review of saved) {
    assert.ok(reviews.some((item) => item.id === review.id && item.review === payload.review));
  }
});

test('invalid review payloads return HTTP errors rather than false success', async () => {
  const invalid = await fetch(base + '/insert_review', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', dealership: 15, review: '', purchase: false })
  });
  assert.equal(invalid.status, 400);
  const malformed = await fetch(base + '/insert_review', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid'
  });
  assert.equal(malformed.status, 400);
});
