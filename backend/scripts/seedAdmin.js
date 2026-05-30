require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getMongoUri, getAdminSeedConfig } = require('../config/env');

const seedAdmin = async () => {
  try {
    const { email: adminEmail, username: adminUsername, password: adminPassword } = getAdminSeedConfig();

    const connStr = getMongoUri();
    console.log(`Connecting to MongoDB for seeding: ${connStr.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    await mongoose.connect(connStr);
    console.log('MongoDB Connected.');

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (existingAdmin) {
      console.log('Admin account already exists in database. Updating details...');

      existingAdmin.name = 'SkillSphere Admin';
      existingAdmin.username = adminUsername;
      existingAdmin.email = adminEmail;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.permissions = 'full_access';

      await existingAdmin.save();
      console.log('Admin account successfully updated!');
    } else {
      console.log('Admin account not found. Creating default admin...');

      const newAdmin = await User.create({
        name: 'SkillSphere Admin',
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        permissions: 'full_access',
      });

      console.log(`Admin account successfully seeded: ${newAdmin.username} (${newAdmin.email})`);
    }

    console.log('Use the ADMIN_PASSWORD from your .env file to sign in. Do not commit .env.');
    await mongoose.disconnect();
    console.log('Database disconnected. Seeding process complete.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
