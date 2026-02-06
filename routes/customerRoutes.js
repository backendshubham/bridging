const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { cacheMiddleware } = require('../middleware/cache');

// Customer-facing routes
router.get('/', (req, res) => {
    res.render('customer/home', {
        title: 'RatnaVeda - Discover Precious Gems',
        contentFile: 'customer/home-content'
    });
});
router.get('/catalog', customerController.catalog);
router.get('/catalog/api', customerController.catalogApi);
router.get('/product/:sku', customerController.product);
router.get('/contact', customerController.contact);
router.get('/privacy-policy', customerController.privacy);
router.get('/terms-conditions', customerController.terms);

module.exports = router;

