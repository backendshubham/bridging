const db = require('../database/db');

const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.redirect('/admin/login');
  }
  
  try {
    const admin = await db('admins')
      .where({ id: req.session.adminId, is_active: true })
      .first();
    
    if (!admin) {
      req.session.destroy();
      return res.redirect('/admin/login');
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.redirect('/admin/login');
  }
};

const requireGuest = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = {
  requireAuth,
  requireGuest
};

