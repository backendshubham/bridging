exports.up = function(knex) {
  return knex.schema.createTable('gemstones', function(table) {
    table.increments('id').primary();
    table.string('sku').unique().notNullable();
    table.string('name').notNullable();
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.string('ratna_type').notNullable(); // Manik, Neelam, etc.
    table.string('origin').nullable();
    
    // Physical Specs
    table.decimal('carat_weight', 10, 2).notNullable();
    table.string('color_grade').nullable();
    table.string('clarity').nullable(); // VVS, VS, etc.
    table.string('cut').nullable();
    table.string('shape').nullable();
    
    // Certification
    table.string('certificate_type').nullable(); // GIA, IGI, GRS
    table.string('certificate_number').nullable();
    table.text('certificate_link').nullable();
    
    // Pricing
    table.decimal('price_per_carat', 12, 2).notNullable();
    table.decimal('total_price', 12, 2).notNullable();
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.decimal('final_price', 12, 2).notNullable();
    
    // Media
    table.text('primary_image').nullable();
    table.json('image_gallery').nullable(); // Array of image URLs
    
    // QR Code
    table.string('qr_code').unique().nullable();
    table.text('qr_code_data').nullable();
    
    // Status
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.integer('scan_count').defaultTo(0);
    
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index('sku');
    table.index('category_id');
    table.index('ratna_type');
    table.index('is_active');
    table.index('qr_code');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('gemstones');
};

