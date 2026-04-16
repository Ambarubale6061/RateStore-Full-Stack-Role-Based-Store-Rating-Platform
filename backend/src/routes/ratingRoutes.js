const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { submitRating, updateRating, getMyRatings, getStoreRatings } = require('../controllers/ratingController');

const ratingValidation = [
  body('store_id').isUUID().withMessage('Valid store ID required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.')
];

// USER routes
router.post('/', verifyToken, requireRole('USER'), ratingValidation, validate, submitRating);
router.put('/', verifyToken, requireRole('USER'), ratingValidation, validate, updateRating);
router.get('/mine', verifyToken, requireRole('USER'), getMyRatings);

// STORE_OWNER route
router.get('/store', verifyToken, requireRole('STORE_OWNER'), getStoreRatings);

module.exports = router;
