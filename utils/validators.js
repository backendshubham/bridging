const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const gemstoneValidation = [
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('ratna_type').trim().notEmpty().withMessage('Ratna Type is required'),
  body('carat_weight').isFloat({ min: 0.01 }).withMessage('Valid carat weight is required'),
  body('price_per_carat').isFloat({ min: 0 }).withMessage('Valid price per carat is required'),
  body('total_price').isFloat({ min: 0 }).withMessage('Valid total price is required'),
  handleValidationErrors
];

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['precious', 'semi_precious']).withMessage('Valid category type is required'),
  handleValidationErrors
];

const adminLoginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  gemstoneValidation,
  categoryValidation,
  adminLoginValidation,
  handleValidationErrors
};

