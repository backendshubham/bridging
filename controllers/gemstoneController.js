const db = require('../database/db');
const { generateQRCode } = require('../utils/qrGenerator');
const { clearCache } = require('../middleware/cache');

const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const { search, category, ratna_type, is_active } = req.query;
    
    let query = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name', 'categories.slug as category_slug');
    
    if (search) {
      query = query.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`);
      });
    }
    
    if (category) {
      query = query.where('categories.slug', category);
    }
    
    if (ratna_type) {
      query = query.where('gemstones.ratna_type', ratna_type);
    }
    
    if (is_active !== undefined) {
      query = query.where('gemstones.is_active', is_active === 'true');
    }
    
    // Get total count separately to avoid GROUP BY issues
    const countQuery = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id');
    
    if (search) {
      countQuery.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`)
          .orWhere('gemstones.ratna_type', 'ilike', `%${search}%`);
      });
    }
    
    if (category) {
      countQuery.where('categories.slug', category);
    }
    
    if (ratna_type) {
      countQuery.where('gemstones.ratna_type', ratna_type);
    }
    
    if (is_active !== undefined) {
      countQuery.where('gemstones.is_active', is_active === 'true');
    }
    
    const total = await countQuery.count('gemstones.id as count').first();
    const gemstones = await query
      .orderBy('gemstones.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    const categories = await db('categories').where({ is_active: true }).orderBy('name');
    
    res.render('admin/gemstones/list', {
      title: 'Manage Gemstones',
      page: 'gemstones',
      contentFile: 'admin/gemstones/list-content',
      gemstones,
      categories,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      },
      filters: { search, category, ratna_type, is_active }
    });
  } catch (error) {
    console.error('List gemstones error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load gemstones'
    });
  }
};

const create = async (req, res) => {
  try {
    const categories = await db('categories').where({ is_active: true }).orderBy('name');
    res.render('admin/gemstones/form', {
      title: 'Add New Gemstone',
      page: 'gemstones',
      contentFile: 'admin/gemstones/form-content',
      gemstone: null,
      categories
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load form'
    });
  }
};

const store = async (req, res) => {
  try {
    const {
      sku, name, category_id, ratna_type, origin,
      carat_weight, color_grade, clarity, cut, shape,
      certificate_type, certificate_number, certificate_link,
      price_per_carat, total_price, discount_percentage
    } = req.body;
    
    // Calculate final price
    const discount = parseFloat(discount_percentage) || 0;
    const basePrice = parseFloat(total_price) || (parseFloat(carat_weight) * parseFloat(price_per_carat));
    const finalPrice = basePrice * (1 - discount / 100);
    
    // Handle image uploads (local storage)
    let primaryImage = null;
    let imageGallery = [];
    
    if (req.files && req.files.primary_image) {
      primaryImage = `/uploads/${req.files.primary_image[0].filename}`;
    }
    
    if (req.files && req.files.gallery_images) {
      // Limit to maximum 5 gallery images
      const galleryFiles = req.files.gallery_images.slice(0, 5);
      imageGallery = galleryFiles.map(file => `/uploads/${file.filename}`);
    }
    
    const gemstoneData = {
      sku,
      name,
      category_id: category_id || null,
      ratna_type,
      origin: origin || null,
      carat_weight: parseFloat(carat_weight),
      color_grade: color_grade || null,
      clarity: clarity || null,
      cut: cut || null,
      shape: shape || null,
      certificate_type: certificate_type || null,
      certificate_number: certificate_number || null,
      certificate_link: certificate_link || null,
      price_per_carat: parseFloat(price_per_carat),
      total_price: basePrice,
      discount_percentage: discount,
      final_price: finalPrice,
      primary_image: primaryImage,
      image_gallery: JSON.stringify(imageGallery),
      is_active: req.body.is_active === 'on'
    };
    
    const [gemstone] = await db('gemstones').insert(gemstoneData).returning('*');
    
    // Generate QR code
    if (gemstone) {
      await generateQRCode(gemstone.id, 'product');
    }
    
    await clearCache('cache:*');
    
    req.flash('success', 'Gemstone added successfully');
    res.redirect('/admin/gemstones');
  } catch (error) {
    console.error('Store gemstone error:', error);
    if (error.code === '23505') { // Unique violation
      req.flash('error', 'SKU already exists');
    } else {
      req.flash('error', 'Failed to add gemstone');
    }
    res.redirect('/admin/gemstones/create');
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const gemstone = await db('gemstones').where({ id }).first();
    
    if (!gemstone) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Gemstone not found'
      });
    }
    
    if (gemstone.image_gallery) {
      try {
        if (typeof gemstone.image_gallery === 'string' && gemstone.image_gallery.startsWith('[')) {
          gemstone.image_gallery = JSON.parse(gemstone.image_gallery);
        } else if (typeof gemstone.image_gallery === 'string') {
          gemstone.image_gallery = [gemstone.image_gallery];
        }
      } catch (error) {
        gemstone.image_gallery = typeof gemstone.image_gallery === 'string' 
          ? [gemstone.image_gallery] 
          : [];
      }
    }
    
    const categories = await db('categories').where({ is_active: true }).orderBy('name');
    
    res.render('admin/gemstones/form', {
      title: 'Edit Gemstone',
      page: 'gemstones',
      contentFile: 'admin/gemstones/form-content',
      gemstone,
      categories
    });
  } catch (error) {
    console.error('Edit form error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load gemstone'
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku, name, category_id, ratna_type, origin,
      carat_weight, color_grade, clarity, cut, shape,
      certificate_type, certificate_number, certificate_link,
      price_per_carat, total_price, discount_percentage
    } = req.body;
    
    const gemstone = await db('gemstones').where({ id }).first();
    
    if (!gemstone) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Gemstone not found'
      });
    }
    
    // Calculate final price
    const discount = parseFloat(discount_percentage) || 0;
    const basePrice = parseFloat(total_price) || (parseFloat(carat_weight) * parseFloat(price_per_carat));
    const finalPrice = basePrice * (1 - discount / 100);
    
    // Handle image uploads (local storage)
    let primaryImage = gemstone.primary_image;
    let imageGallery = [];
    if (gemstone.image_gallery) {
      try {
        if (typeof gemstone.image_gallery === 'string' && gemstone.image_gallery.startsWith('[')) {
          imageGallery = JSON.parse(gemstone.image_gallery);
        } else if (typeof gemstone.image_gallery === 'string') {
          imageGallery = [gemstone.image_gallery];
        } else if (Array.isArray(gemstone.image_gallery)) {
          imageGallery = gemstone.image_gallery;
        }
      } catch (error) {
        imageGallery = typeof gemstone.image_gallery === 'string' 
          ? [gemstone.image_gallery] 
          : [];
      }
    }
    
    if (req.files && req.files.primary_image) {
      primaryImage = `/uploads/${req.files.primary_image[0].filename}`;
    }
    
    if (req.files && req.files.gallery_images) {
      // Limit to maximum 5 gallery images total
      const newImages = req.files.gallery_images.slice(0, 5).map(file => `/uploads/${file.filename}`);
      // Combine with existing, but limit total to 5
      imageGallery = [...imageGallery, ...newImages].slice(0, 5);
    }
    
    const gemstoneData = {
      sku,
      name,
      category_id: category_id || null,
      ratna_type,
      origin: origin || null,
      carat_weight: parseFloat(carat_weight),
      color_grade: color_grade || null,
      clarity: clarity || null,
      cut: cut || null,
      shape: shape || null,
      certificate_type: certificate_type || null,
      certificate_number: certificate_number || null,
      certificate_link: certificate_link || null,
      price_per_carat: parseFloat(price_per_carat),
      total_price: basePrice,
      discount_percentage: discount,
      final_price: finalPrice,
      primary_image: primaryImage,
      image_gallery: JSON.stringify(imageGallery),
      is_active: req.body.is_active === 'on'
    };
    
    await db('gemstones').where({ id }).update(gemstoneData);
    
    // Regenerate QR code if SKU changed
    if (sku !== gemstone.sku) {
      await generateQRCode(id, 'product');
    }
    
    await clearCache('cache:*');
    
    req.flash('success', 'Gemstone updated successfully');
    res.redirect('/admin/gemstones');
  } catch (error) {
    console.error('Update gemstone error:', error);
    req.flash('error', 'Failed to update gemstone');
    res.redirect(`/admin/gemstones/${id}/edit`);
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await db('gemstones').where({ id }).delete();
    await clearCache('cache:*');
    req.flash('success', 'Gemstone deleted successfully');
    res.redirect('/admin/gemstones');
  } catch (error) {
    console.error('Delete gemstone error:', error);
    req.flash('error', 'Failed to delete gemstone');
    res.redirect('/admin/gemstones');
  }
};

const regenerateQR = async (req, res) => {
  try {
    const { id } = req.params;
    await generateQRCode(id, 'product');
    req.flash('success', 'QR code regenerated successfully');
    res.redirect(`/admin/gemstones/${id}/edit`);
  } catch (error) {
    console.error('Regenerate QR error:', error);
    req.flash('error', 'Failed to regenerate QR code');
    res.redirect(`/admin/gemstones/${id}/edit`);
  }
};

module.exports = {
  list,
  create,
  store,
  edit,
  update,
  destroy,
  regenerateQR
};

