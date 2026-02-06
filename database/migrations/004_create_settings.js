exports.up = function(knex) {
  return knex.schema.createTable('settings', function(table) {
    table.increments('id').primary();
    table.string('key').unique().notNullable();
    table.text('value').nullable();
    table.string('type').defaultTo('text'); // text, html, json
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('settings');
};

