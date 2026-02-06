const db = require('../database/db');
const { clearCache } = require('../middleware/cache');
const slugify = require('slugify');

const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const total = await db('categories').count('id as count').first();
    const categories = await db('categories')
      .orderBy('sort_order')
      .orderBy('name')
      .limit(limit)
      .offset(offset);
    
    res.render('admin/categories/list', {
      title: 'Manage Categories',
      page: 'categories',
      contentFile: 'admin/categories/list-content',
      categories,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load categories'
    });
  }
};

const store = async (req, res) => {
  try {
    const { name, type, description, sort_order, is_active } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    
    await db('categories').insert({
      name,
      slug,
      type,
      description: description || null,
      sort_order: parseInt(sort_order) || 0,
      is_active: is_active === 'on'
    });
    
    await clearCache('cache:*');
    req.flash('success', 'Category added successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Store category error:', error);
    if (error.code === '23505') {
      req.flash('error', 'Category slug already exists');
    } else {
      req.flash('error', 'Failed to add category');
    }
    res.redirect('/admin/categories');
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, sort_order, is_active } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    
    await db('categories').where({ id }).update({
      name,
      slug,
      type,
      description: description || null,
      sort_order: parseInt(sort_order) || 0,
      is_active: is_active === 'on'
    });
    
    await clearCache('cache:*');
    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Update category error:', error);
    req.flash('error', 'Failed to update category');
    res.redirect('/admin/categories');
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await db('categories').where({ id }).delete();
    await clearCache('cache:*');
    req.flash('success', 'Category deleted successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Delete category error:', error);
    req.flash('error', 'Failed to delete category');
    res.redirect('/admin/categories');
  }
};

module.exports = {
  list,
  store,
  update,
  destroy
};

