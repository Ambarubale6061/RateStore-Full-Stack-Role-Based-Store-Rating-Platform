const { pool } = require('../config/db');

const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;

    // verify store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (!storeCheck.rows[0]) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // check if already rated
    const existing = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, store_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: 'You have already rated this store. Use PUT to update your rating.',
        currentRating: existing.rows[0].rating
      });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       RETURNING id, rating, created_at`,
      [userId, store_id, rating]
    );

    // get updated average
    const avg = await pool.query(
      'SELECT ROUND(AVG(rating)::numeric, 2) as avg FROM ratings WHERE store_id = $1',
      [store_id]
    );

    res.status(201).json({
      message: 'Rating submitted.',
      rating: result.rows[0],
      newAverage: avg.rows[0].avg
    });
  } catch (err) {
    next(err);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, store_id]
    );

    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'No rating found to update. Submit a rating first.' });
    }

    await pool.query(
      'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
      [rating, userId, store_id]
    );

    const avg = await pool.query(
      'SELECT ROUND(AVG(rating)::numeric, 2) as avg FROM ratings WHERE store_id = $1',
      [store_id]
    );

    res.json({
      message: 'Rating updated.',
      newAverage: avg.rows[0].avg
    });
  } catch (err) {
    next(err);
  }
};

const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              s.id as store_id, s.name as store_name, s.address as store_address,
              ROUND(AVG(r2.rating)::numeric, 2) as store_avg_rating
       FROM ratings r
       JOIN stores s ON s.id = r.store_id
       LEFT JOIN ratings r2 ON r2.store_id = s.id
       WHERE r.user_id = $1
       GROUP BY r.id, r.rating, r.created_at, r.updated_at, s.id, s.name, s.address
       ORDER BY r.updated_at DESC`,
      [userId]
    );

    res.json({ ratings: result.rows });
  } catch (err) {
    next(err);
  }
};

// Store owner: get ratings for their store
const getStoreRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const storeResult = await pool.query(
      'SELECT id, name FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (!storeResult.rows[0]) {
      return res.status(404).json({ message: 'No store found for your account.' });
    }

    const store = storeResult.rows[0];

    const ratingsResult = await pool.query(
      `SELECT r.id, r.rating, r.created_at,
              u.id as user_id, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    const avg = await pool.query(
      'SELECT ROUND(AVG(rating)::numeric, 2) as avg, COUNT(*) as total FROM ratings WHERE store_id = $1',
      [store.id]
    );

    res.json({
      store,
      ratings: ratingsResult.rows,
      averageRating: avg.rows[0].avg,
      totalRatings: parseInt(avg.rows[0].total)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRating, updateRating, getMyRatings, getStoreRatings };
