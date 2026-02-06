const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { generateQRCode, generateMasterQR } = require('../utils/qrGenerator');
const { clearCache } = require('../middleware/cache');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await db('admins')
      .where({ username, is_active: true })
      .first();
    
    if (!admin) {
      return res.render('admin/login', {
        error: 'Invalid username or password',
        title: 'Admin Login',
        username: '' // Clear username on error
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.render('admin/login', {
        error: 'Invalid username or password',
        title: 'Admin Login',
        username: '' // Clear username on error
      });
    }
    
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    
    await db('admins')
      .where({ id: admin.id })
      .update({ last_login: db.fn.now() });
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      error: 'An error occurred. Please try again.',
      title: 'Admin Login'
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

const dashboard = async (req, res) => {
  try {
    const totalGemstones = await db('gemstones').count('id as count').first();
    const activeGemstones = await db('gemstones').where({ is_active: true }).count('id as count').first();
    const totalCategories = await db('categories').count('id as count').first();
    
    const recentGemstones = await db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name')
      .orderBy('gemstones.created_at', 'desc')
      .limit(10);
    
    const mostScanned = await db('gemstones')
      .leftJoin('categories', 'gemstones.category_id', 'categories.id')
      .select('gemstones.*', 'categories.name as category_name')
      .orderBy('gemstones.scan_count', 'desc')
      .limit(10);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      page: 'dashboard',
      contentFile: 'admin/dashboard-content',
      admin: req.admin,
      stats: {
        totalGemstones: totalGemstones.count,
        activeGemstones: activeGemstones.count,
        totalCategories: totalCategories.count
      },
      recentGemstones,
      mostScanned
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load dashboard'
    });
  }
};

const getMasterQR = async (req, res) => {
  try {
    const qrData = await generateMasterQR();
    res.render('admin/master-qr', {
      title: 'Master QR Code',
      page: 'master-qr',
      contentFile: 'admin/master-qr-content',
      qrData
    });
  } catch (error) {
    console.error('Master QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

module.exports = {
  login,
  logout,
  dashboard,
  getMasterQR
};

