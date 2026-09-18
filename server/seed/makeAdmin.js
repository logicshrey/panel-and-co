require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin -- user@example.com');
    process.exitCode = 1;
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured in server/.env');
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    user.role = 'admin';
    await user.save();
    console.log(`User ${user.email} is now an admin.`);
  } catch (error) {
    console.error(`Could not make admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

makeAdmin();
