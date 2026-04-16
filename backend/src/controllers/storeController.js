const { pool } = require('../config/db');

const getStores = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'name', order = 'asc' } = req.query;
    const userId = req.user?.id;

    const allowedSort = ['name', 'address', 'avg_rating', 'created_at'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sortExpr = sortField === 'avg_rating' ? 'avg_rating' : `s.${sortField}`;

    const filterParams = [];
    let whereClause = '';
    if (search) {
      filterParams.push(`%${search}%`);
      whereClause = `WHERE (s.name ILIKE $1 OR s.address ILIKE $1)`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM stores s ${whereClause}`,
      filterParams
    );

    const dataParams = [...filterParams];
    let userRatingSelect = ', NULL::integer as my_rating';
    if (userId) {
      dataParams.push(userId);
      userRatingSelect = `, (SELECT rating FROM ratings WHERE user_id = $${dataParams.length} AND store_id = s.id) as my_rating`;
    }
    dataParams.push(parseInt(limit));
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;

    const dataResult = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.image_url, s.owner_id,
              ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
              COUNT(r.id)::integer as total_ratings
              ${userRatingSelect}
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id, s.name, s.email, s.address, s.image_url, s.owner_id
       ORDER BY ${sortExpr} ${sortOrder} NULLS LAST
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams
    );

    res.json({
      stores: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const params = [id];
    let userRatingSelect = ', NULL::integer as my_rating';
    if (userId) {
      params.push(userId);
      userRatingSelect = `, (SELECT rating FROM ratings WHERE user_id = $2 AND store_id = s.id) as my_rating`;
    }

    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.image_url, s.owner_id,
              u.name as owner_name,
              ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
              COUNT(r.id)::integer as total_ratings
              ${userRatingSelect}
       FROM stores s
       LEFT JOIN users u ON u.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.id = $1
       GROUP BY s.id, s.name, s.email, s.address, s.image_url, s.owner_id, u.name`,
      params
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Store not found.' });
    res.json({ store: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStores, getStoreById };
