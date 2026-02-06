exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Insert default categories
  await knex('categories').insert([
    {
      name: 'Diamonds',
      slug: 'diamonds',
      type: 'precious',
      description: 'Premium diamond collection',
      sort_order: 1,
      is_active: true
    },
    {
      name: 'Rubies',
      slug: 'rubies',
      type: 'precious',
      description: 'Exquisite ruby gemstones',
      sort_order: 2,
      is_active: true
    },
    {
      name: 'Sapphires',
      slug: 'sapphires',
      type: 'precious',
      description: 'Beautiful sapphire collection',
      sort_order: 3,
      is_active: true
    },
    {
      name: 'Emeralds',
      slug: 'emeralds',
      type: 'precious',
      description: 'Rare emerald gemstones',
      sort_order: 4,
      is_active: true
    },
    {
      name: 'Pearls',
      slug: 'pearls',
      type: 'precious',
      description: 'Luxurious pearl collection',
      sort_order: 5,
      is_active: true
    },
    {
      name: 'Other Gemstones',
      slug: 'other-gemstones',
      type: 'semi_precious',
      description: 'Various precious and semi-precious stones',
      sort_order: 6,
      is_active: true
    }
  ]);
};

