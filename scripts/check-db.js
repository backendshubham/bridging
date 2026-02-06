// Script to check and seed database if needed
const db = require('../database/db');
const bcrypt = require('bcryptjs');

async function checkAndSeed() {
  try {
    console.log('Checking database...');
    
    // Check if admins table exists and has data
    const adminCount = await db('admins').count('* as count').first();
    console.log(`Found ${adminCount.count} admin(s) in database`);
    
    if (parseInt(adminCount.count) === 0) {
      console.log('No admins found. Seeding default admin...');
      
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await db('admins').insert({
        username: 'admin',
        email: 'admin@ratnaveda.com',
        password_hash: passwordHash,
        full_name: 'System Administrator',
        is_active: true
      });
      
      console.log('✅ Default admin created!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Database already has admin users.');
    }
    
    // Check categories
    const categoryCount = await db('categories').count('* as count').first();
    console.log(`Found ${categoryCount.count} category(ies) in database`);
    
    // Check settings
    const settingsCount = await db('settings').count('* as count').first();
    console.log(`Found ${settingsCount.count} setting(s) in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

checkAndSeed();

