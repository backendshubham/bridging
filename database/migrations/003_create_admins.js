exports.up = function(knex) {
  return knex.schema.createTable('admins', function(table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('full_name').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('admins');
};

