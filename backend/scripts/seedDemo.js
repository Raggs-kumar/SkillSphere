require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const { getMongoUri } = require('../config/env');

const seedDemo = async () => {
  try {
    await mongoose.connect(getMongoUri());
    console.log('Connected for demo seed...');

    const client = await User.findOne({ role: 'client' });
    if (!client) {
      console.log('No client user found. Register a client account first, then re-run seed:demo');
      process.exit(0);
    }

    const existing = await Project.countDocuments({ client: client._id });
    if (existing >= 3) {
      console.log('Demo projects already exist. Skipping.');
      process.exit(0);
    }

    const demos = [
      {
        title: 'Hyperlocal Delivery Router',
        description: 'Integrate Google Maps API routing to optimize local package courier routes.',
        budget: 1500,
        location: { city: 'Downtown', distanceKm: 1.2 },
      },
      {
        title: 'MERN Authentication Bug Fixing',
        description: 'Debug JWT and CORS headers on Express backend. Quick turnaround required.',
        budget: 350,
        location: { city: 'Tech Park', distanceKm: 3.5 },
      },
      {
        title: 'Local Bakery Landing Page',
        description: 'Responsive landing page using React and Tailwind CSS for online orders.',
        budget: 600,
        location: { city: 'Main Street', distanceKm: 0.8 },
      },
    ];

    await Project.insertMany(
      demos.map((d) => ({
        ...d,
        client: client._id,
        status: 'open',
      }))
    );

    console.log(`Seeded ${demos.length} demo projects for client: ${client.email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Demo seed error: ${error.message}`);
    process.exit(1);
  }
};

seedDemo();
