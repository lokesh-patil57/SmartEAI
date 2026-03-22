import mongoose from 'mongoose';
import { Application } from './src/models/Application.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const app = await Application.findOne({});
  console.log(JSON.stringify(app?.timeline, null, 2));
  process.exit();
}
run();
