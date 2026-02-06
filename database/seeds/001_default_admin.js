const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('admins').del();
  
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await knex('admins').insert([
    {
      username: 'admin',
      email: 'admin@ratnaveda.com',
      password_hash: passwordHash,
      full_name: 'System Administrator',
      is_active: true
    }
  ]);
};

