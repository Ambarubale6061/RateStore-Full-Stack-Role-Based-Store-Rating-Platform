const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getStores, getStoreById } = require('../controllers/storeController');

// token is optional for stores - logged in users see their rating too
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // just ignore invalid tokens here
    }
  }
  next();
};

router.get('/', optionalAuth, getStores);
router.get('/:id', optionalAuth, getStoreById);

module.exports = router;
