const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

//const DB = process.env.DATABASE;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('✅ Data successfully loaded!');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('✅ Data successfully deleted!');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  process.exit();
};

// Connect FIRST, then run the operation
mongoose.connect(DB).then(() => {
  console.log('✅ DB connected!');
  if (process.argv[2] === '--import') importData();
  else if (process.argv[2] === '--delete') deleteData();
  else {
    console.log('Please use --import or --delete flag');
    process.exit();
  }
}).catch(err => {
  console.log('❌ DB connection failed:', err.message);
  process.exit(1);
});