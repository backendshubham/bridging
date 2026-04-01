const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/v1/categories - Get all active categories
router.get('/categories', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = db('categories').select('id', 'name', 'slug', 'type', 'description', 'sort_order', 'is_active');
    
    // Filter by status if provided
    if (status === 'active') {
      query = query.where('is_active', true);
    }
    
    const categories = await query
      .orderBy('sort_order')
      .orderBy('name');
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('API: Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// GET /api/v1/categories/:id - Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await db('categories')
      .where({ id: req.params.id })
      .first();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('API: Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      message: error.message
    });
  }
});

// GET /api/v1/gemstones - Get gemstones (for catalog)
router.get('/gemstones', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { category, search, min_price, max_price, type } = req.query;
    
    let query = db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select(
        'gemstones.*',
        'categories.name as category_name',
        'categories.slug as category_slug'
      )
      .where('gemstones.is_active', true);
    
    // Apply filters
    if (category) {
      query = query.where('categories.slug', category);
    }
    
    if (search) {
      query = query.where(function() {
        this.where('gemstones.name', 'ilike', `%${search}%`)
          .orWhere('gemstones.description', 'ilike', `%${search}%`)
          .orWhere('gemstones.sku', 'ilike', `%${search}%`);
      });
    }
    
    if (min_price) {
      query = query.where('gemstones.final_price', '>=', parseFloat(min_price));
    }
    
    if (max_price) {
      query = query.where('gemstones.final_price', '<=', parseFloat(max_price));
    }
    
    if (type) {
      query = query.where('gemstones.ratna_type', type);
    }
    
    // Get total count
    const countQuery = query.clone().clearSelect().clearOrder().count('gemstones.id as count').first();
    const total = await countQuery;
    
    // Get paginated results
    const gemstones = await query
      .orderBy('gemstones.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Parse image_gallery safely
    const formattedGemstones = gemstones.map(stone => {
      let imageGallery = [];
      if (stone.image_gallery) {
        try {
          if (typeof stone.image_gallery === 'string') {
            if (stone.image_gallery.startsWith('[')) {
              imageGallery = JSON.parse(stone.image_gallery);
            } else {
              imageGallery = [stone.image_gallery];
            }
          } else if (Array.isArray(stone.image_gallery)) {
            imageGallery = stone.image_gallery;
          }
        } catch (e) {
          imageGallery = [];
        }
      }
      
      return {
        ...stone,
        image_gallery: imageGallery
      };
    });
    
    res.json({
      success: true,
      data: formattedGemstones,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit),
        hasMore: page < Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('API: Error fetching gemstones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gemstones',
      message: error.message
    });
  }
});

// GET /api/v1/gemstones/:sku - Get single gemstone by SKU
router.get('/gemstones/:sku', async (req, res) => {
  try {
    const gemstone = await db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select(
        'gemstones.*',
        'categories.name as category_name',
        'categories.slug as category_slug'
      )
      .where('gemstones.sku', req.params.sku)
      .where('gemstones.is_active', true)
      .first();
    
    if (!gemstone) {
      return res.status(404).json({
        success: false,
        error: 'Gemstone not found'
      });
    }
    
    // Parse image_gallery safely
    let imageGallery = [];
    if (gemstone.image_gallery) {
      try {
        if (typeof gemstone.image_gallery === 'string') {
          if (gemstone.image_gallery.startsWith('[')) {
            imageGallery = JSON.parse(gemstone.image_gallery);
          } else {
            imageGallery = [gemstone.image_gallery];
          }
        } else if (Array.isArray(gemstone.image_gallery)) {
          imageGallery = gemstone.image_gallery;
        }
      } catch (e) {
        imageGallery = [];
      }
    }
    
    res.json({
      success: true,
      data: {
        ...gemstone,
        image_gallery: imageGallery
      }
    });
  } catch (error) {
    console.error('API: Error fetching gemstone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gemstone',
      message: error.message
    });
  }
});

module.exports = router;

