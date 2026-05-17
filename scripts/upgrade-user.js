const mongoose = require('mongoose');

async function run() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    await users.updateOne(
      { email: 'mansikarki2005@gmail.com' },
      { $set: { roles: ['attendee', 'organizer'], organizerStatus: 'approved', organizerApprovedAt: new Date() } }
    );
    console.log('User upgraded to organizer successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
