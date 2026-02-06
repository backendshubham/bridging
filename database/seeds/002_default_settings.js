exports.seed = async function(knex) {
  await knex('settings').del();
  
  await knex('settings').insert([
    {
      key: 'privacy_policy',
      value: '<h2>Privacy Policy</h2><p>Your privacy policy content goes here...</p>',
      type: 'html'
    },
    {
      key: 'terms_conditions',
      value: '<h2>Terms & Conditions</h2><p>Your terms and conditions content goes here...</p>',
      type: 'html'
    },
    {
      key: 'shop_name',
      value: 'RatnaVeda',
      type: 'text'
    },
    {
      key: 'shop_address',
      value: '',
      type: 'text'
    },
    {
      key: 'contact_email',
      value: 'info@ratnaveda.com',
      type: 'text'
    },
    {
      key: 'contact_phone',
      value: '',
      type: 'text'
    },
    {
      key: 'business_hours',
      value: 'Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed',
      type: 'text'
    },
    {
      key: 'map_latitude',
      value: '28.6139',
      type: 'text'
    },
    {
      key: 'map_longitude',
      value: '77.2090',
      type: 'text'
    }
  ]);
};

