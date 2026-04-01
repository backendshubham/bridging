exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('gemstones').del();

  const preciousCat = await knex('categories').where({ slug: 'precious' }).first();
  const semiCat = await knex('categories').where({ slug: 'semi-precious' }).first();

  await knex('gemstones').insert([
    {
      sku: 'RV-RUBY-001',
      name: 'Burmese Star Ruby',
      category_id: preciousCat ? preciousCat.id : null,
      ratna_type: 'Manik',
      origin: 'Burma (Myanmar)',
      carat_weight: 5.20,
      color_grade: 'Deep Red',
      clarity: 'VS1',
      cut: 'Oval Cabochon',
      shape: 'Oval',
      certificate_type: 'GIA',
      certificate_number: 'GIA-2024-001',
      price_per_carat: 24000.00,
      total_price: 124800.00,
      discount_percentage: 0,
      final_price: 124800.00,
      primary_image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&q=80&w=800',
      image_gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&q=80&w=800'
      ]),
      is_active: true,
      is_featured: true
    },
    {
      sku: 'RV-SAP-002',
      name: 'Kashmir Blue Sapphire',
      category_id: preciousCat ? preciousCat.id : null,
      ratna_type: 'Neelam',
      origin: 'Kashmir, India',
      carat_weight: 3.85,
      color_grade: 'Royal Blue',
      clarity: 'VVS1',
      cut: 'Cushion',
      shape: 'Cushion',
      certificate_type: 'IGI',
      certificate_number: 'IGI-2024-045',
      price_per_carat: 60000.00,
      total_price: 231000.00,
      discount_percentage: 0,
      final_price: 231000.00,
      primary_image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=800',
      image_gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=800'
      ]),
      is_active: true,
      is_featured: true
    },
    {
      sku: 'RV-EMR-003',
      name: 'Colombian Emerald',
      category_id: preciousCat ? preciousCat.id : null,
      ratna_type: 'Panna',
      origin: 'Colombia',
      carat_weight: 4.10,
      color_grade: 'Vivid Green',
      clarity: 'F1',
      cut: 'Emerald Cut',
      shape: 'Rectangular',
      certificate_type: 'GIA',
      certificate_number: 'GIA-2024-078',
      price_per_carat: 45731.70,
      total_price: 187500.00,
      discount_percentage: 0,
      final_price: 187500.00,
      primary_image: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?auto=format&fit=crop&q=80&w=800',
      image_gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1544923246-77307dd654ca?auto=format&fit=crop&q=80&w=800'
      ]),
      is_active: true,
      is_featured: true
    }
  ]);
};
