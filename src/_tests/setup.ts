import { connectDatabaseTest } from '../database/mongodb';

beforeAll(async () => {
  await connectDatabaseTest();
});

afterAll(async () => {
  // Clean up database connection after all tests
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});
