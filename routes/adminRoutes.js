const express = require('express');
const router = express.Router();
const { requireAuth, requireGuest } = require('../middleware/auth');
const upload = require('../config/multer');
const adminController = require('../controllers/adminController');
const gemstoneController = require('../controllers/gemstoneController');
const categoryController = require('../controllers/categoryController');
const settingsController = require('../controllers/settingsController');

// Auth routes
router.get('/login', requireGuest, (req, res) => {
  res.render('admin/login', { title: 'Admin Login', error: null });
});

router.post('/login', requireGuest, adminController.login);
router.get('/logout', requireAuth, adminController.logout);

// Dashboard
router.get('/dashboard', requireAuth, adminController.dashboard);
router.get('/master-qr', requireAuth, adminController.getMasterQR);

// Gemstone routes
router.get('/gemstones', requireAuth, gemstoneController.list);
router.get('/gemstones/create', requireAuth, gemstoneController.create);
router.post('/gemstones', requireAuth, upload.fields([
  { name: 'primary_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 5 }
]), gemstoneController.store);
router.get('/gemstones/:id/edit', requireAuth, gemstoneController.edit);
router.post('/gemstones/:id', requireAuth, upload.fields([
  { name: 'primary_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 5 }
]), gemstoneController.update);
router.post('/gemstones/:id/delete', requireAuth, gemstoneController.destroy);
router.post('/gemstones/:id/regenerate-qr', requireAuth, gemstoneController.regenerateQR);

// Category routes
router.get('/categories', requireAuth, categoryController.list);
router.post('/categories', requireAuth, categoryController.store);
router.post('/categories/:id', requireAuth, categoryController.update);
router.post('/categories/:id/delete', requireAuth, categoryController.destroy);

// Settings routes
router.get('/settings', requireAuth, settingsController.index);
router.post('/settings', requireAuth, settingsController.update);

module.exports = router;

