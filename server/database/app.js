'use strict';

const mongoose = require('mongoose');
const { createApp } = require('./api');
const { seed } = require('./seed');

async function start() {
  const uri = process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/car_dealership_capstone';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await seed();
  const port = Number(process.env.BACKEND_PORT || 3030);
  const host = process.env.BACKEND_HOST || '127.0.0.1';
  const server = createApp().listen(port, host, () => {
    console.log('Dealer API with MongoDB running at http://' + host + ':' + port);
  });
  const shutdown = () => {
    server.close(() => {
      mongoose.disconnect().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Dealer API startup failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { start };
