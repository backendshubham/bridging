const db = require('../database/db');

const catalog = async (req, res) => {
  try {
    const { carat_min, carat_max, price_min, price_max, type, category, search } = req.query;
    
    let query = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('gemstones.is_active', true);
    
    if (carat_min) {
      query = query.where('gemstones.carat_weight', '>=', parseFloat(carat_min));
    }
    
    if (carat_max) {
      query = query.where('gemstones.carat_weight', '<=', parseFloat(carat_max));
    }
    
    if (price_min) {
      query = query.where('gemstones.final_price', '>=', parseFloat(price_min));
    }
    
    if (price_max) {
      query = query.where('gemstones.final_price', '<=', parseFloat(price_max));
    }
    
    if (type) {
      query = query.where('gemstones.ratna_type', type);
    }
    
    if (category) {
      query = query.where('categories.slug', category);
    }
    
    if (search) {
      query = query.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`);
      });
    }
    
    // Get total count for pagination
    const totalQuery = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .where('gemstones.is_active', true);
    
    if (carat_min) totalQuery.where('gemstones.carat_weight', '>=', parseFloat(carat_min));
    if (carat_max) totalQuery.where('gemstones.carat_weight', '<=', parseFloat(carat_max));
    if (price_min) totalQuery.where('gemstones.final_price', '>=', parseFloat(price_min));
    if (price_max) totalQuery.where('gemstones.final_price', '<=', parseFloat(price_max));
    if (type) totalQuery.where('gemstones.ratna_type', type);
    if (category) totalQuery.where('categories.slug', category);
    if (search) {
      totalQuery.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`);
      });
    }
    
    const totalCount = await totalQuery.count('gemstones.id as count').first();
    const total = parseInt(totalCount.count);
    
    // Pagination for initial load (10 items)
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const gemstones = await query
      .orderBy('gemstones.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    const categories = await db('categories').where({ is_active: true }).orderBy('name');
    const ratnaTypes = await db('gemstones')
      .where({ is_active: true })
      .distinct('ratna_type')
      .pluck('ratna_type')
      .orderBy('ratna_type');
    
    const maxCarat = await db('gemstones')
      .where({ is_active: true })
      .max('carat_weight as max')
      .first();
    
    const maxPrice = await db('gemstones')
      .where({ is_active: true })
      .max('final_price as max')
      .first();
    
    res.render('customer/catalog', {
      title: 'Gemstone Catalog',
      contentFile: 'customer/catalog-content',
      gemstones,
      categories,
      ratnaTypes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      filters: {
        carat_min: carat_min || '',
        carat_max: carat_max || '',
        price_min: price_min || '',
        price_max: price_max || '',
        type: type || '',
        category: category || '',
        search: search || ''
      },
      maxCarat: maxCarat?.max || 10,
      maxPrice: maxPrice?.max || 1000000
    });
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).render('customer/error', {
      title: 'Error',
      message: 'Failed to load catalog'
    });
  }
};

const product = async (req, res) => {
  try {
    const { sku } = req.params;
    
    const gemstone = await db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('gemstones.sku', sku)
      .where('gemstones.is_active', true)
      .first();
    
    if (!gemstone) {
      return res.status(404).render('customer/error', {
        title: 'Not Found',
        message: 'Gemstone not found'
      });
    }
    
    // Parse image gallery - handle both JSON string and plain string
    if (gemstone.image_gallery) {
      try {
        // Try to parse as JSON first
        if (typeof gemstone.image_gallery === 'string' && gemstone.image_gallery.startsWith('[')) {
          gemstone.image_gallery = JSON.parse(gemstone.image_gallery);
        } else if (typeof gemstone.image_gallery === 'string' && !gemstone.image_gallery.startsWith('/')) {
          // Might be JSON without brackets
          gemstone.image_gallery = JSON.parse(gemstone.image_gallery);
        } else if (typeof gemstone.image_gallery === 'string') {
          // It's a plain string path, convert to array
          gemstone.image_gallery = [gemstone.image_gallery];
        }
      } catch (error) {
        // If parsing fails, treat as single image path
        gemstone.image_gallery = typeof gemstone.image_gallery === 'string' 
          ? [gemstone.image_gallery] 
          : [];
      }
    } else {
      gemstone.image_gallery = [];
    }
    
    // Increment view count
    await db('gemstones')
      .where({ id: gemstone.id })
      .increment('view_count', 1);
    
    // Increment scan count if accessed via QR
    if (req.query.qr === 'true') {
      await db('gemstones')
        .where({ id: gemstone.id })
        .increment('scan_count', 1);
    }
    
    res.render('customer/product', {
      title: gemstone.name,
      contentFile: 'customer/product-content',
      gemstone
    });
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).render('customer/error', {
      title: 'Error',
      message: 'Failed to load product'
    });
  }
};

const privacy = async (req, res) => {
  try {
    const setting = await db('settings').where({ key: 'privacy_policy' }).first();
    res.render('customer/legal', {
      title: 'Privacy Policy',
      contentFile: 'customer/legal-content',
      content: setting?.value || '<p>Privacy policy content not available.</p>'
    });
  } catch (error) {
    console.error('Privacy error:', error);
    res.status(500).render('customer/error', {
      title: 'Error',
      message: 'Failed to load privacy policy'
    });
  }
};

const contact = async (req, res) => {
  try {
    const settings = await db('settings').orderBy('key');
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.render('customer/contact', {
      title: 'Contact Us',
      contentFile: 'customer/contact-content',
      settings: settingsObj,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).render('customer/error', {
      title: 'Error',
      message: 'Failed to load contact page'
    });
  }
};

const terms = async (req, res) => {
  try {
    const setting = await db('settings').where({ key: 'terms_conditions' }).first();
    res.render('customer/legal', {
      title: 'Terms & Conditions',
      contentFile: 'customer/legal-content',
      content: setting?.value || '<p>Terms and conditions content not available.</p>'
    });
  } catch (error) {
    console.error('Terms error:', error);
    res.status(500).render('customer/error', {
      title: 'Error',
      message: 'Failed to load terms and conditions'
    });
  }
};

const catalogApi = async (req, res) => {
  try {
    const { carat_min, carat_max, price_min, price_max, type, category, search, page } = req.query;
    
    let query = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('gemstones.is_active', true);
    
    if (carat_min) query = query.where('gemstones.carat_weight', '>=', parseFloat(carat_min));
    if (carat_max) query = query.where('gemstones.carat_weight', '<=', parseFloat(carat_max));
    if (price_min) query = query.where('gemstones.final_price', '>=', parseFloat(price_min));
    if (price_max) query = query.where('gemstones.final_price', '<=', parseFloat(price_max));
    if (type) query = query.where('gemstones.ratna_type', type);
    if (category) query = query.where('categories.slug', category);
    if (search) {
      query = query.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`);
      });
    }
    
    const totalQuery = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .where('gemstones.is_active', true);
    
    if (carat_min) totalQuery.where('gemstones.carat_weight', '>=', parseFloat(carat_min));
    if (carat_max) totalQuery.where('gemstones.carat_weight', '<=', parseFloat(carat_max));
    if (price_min) totalQuery.where('gemstones.final_price', '>=', parseFloat(price_min));
    if (price_max) totalQuery.where('gemstones.final_price', '<=', parseFloat(price_max));
    if (type) totalQuery.where('gemstones.ratna_type', type);
    if (category) totalQuery.where('categories.slug', category);
    if (search) {
      totalQuery.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`);
      });
    }
    
    const totalCount = await totalQuery.count('gemstones.id as count').first();
    const total = parseInt(totalCount.count);
    
    const currentPage = parseInt(page) || 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    const gemstones = await query
      .orderBy('gemstones.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Parse image gallery for each gemstone
    gemstones.forEach(stone => {
      if (stone.image_gallery) {
        try {
          if (typeof stone.image_gallery === 'string' && stone.image_gallery.startsWith('[')) {
            stone.image_gallery = JSON.parse(stone.image_gallery);
          } else if (typeof stone.image_gallery === 'string') {
            stone.image_gallery = [stone.image_gallery];
          }
        } catch (e) {
          stone.image_gallery = [];
        }
      } else {
        stone.image_gallery = [];
      }
    });
    
    res.json({
      gemstones,
      pagination: {
        page: currentPage,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: currentPage * limit < total
      }
    });
  } catch (error) {
    console.error('Catalog API error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
};

module.exports = {
  catalog,
  catalogApi,
  product,
  contact,
  privacy,
  terms
};

