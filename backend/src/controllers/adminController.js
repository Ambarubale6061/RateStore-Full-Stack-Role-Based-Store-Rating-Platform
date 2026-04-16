const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const {
  uploadImage,
  deleteImage,
  extractPathFromUrl,
} = require("../config/storage");

// Helper: generate JWT (same as in authController)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

// NEW: Admin login – only succeeds if user has role 'ADMIN'
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password, role, address FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    if (user.role !== "ADMIN") {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.json({
      message: "Admin login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// All other functions remain exactly as originally provided:
// getDashboardStats, getAllUsers, getUserById, createUser,
// getAllStores, createStore, updateStoreImage, deleteStoreImage
// ------------------------------------------------------------------

const getDashboardStats = async (req, res, next) => {
  try {
    const [usersRes, storesRes, ratingsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM stores"),
      pool.query("SELECT COUNT(*) FROM ratings"),
    ]);

    res.json({
      totalUsers: parseInt(usersRes.rows[0].count),
      totalStores: parseInt(storesRes.rows[0].count),
      totalRatings: parseInt(ratingsRes.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const {
      name,
      email,
      role,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (name) {
      conditions.push(`u.name ILIKE $${idx++}`);
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push(`u.email ILIKE $${idx++}`);
      params.push(`%${email}%`);
    }
    if (role) {
      conditions.push(`u.role = $${idx++}`);
      params.push(role.toUpperCase());
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const allowedSort = ["name", "email", "role", "created_at"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = order === "asc" ? "ASC" : "DESC";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params,
    );

    const dataResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.address, u.created_at,
              s.name as store_name,
              ROUND(AVG(r.rating)::numeric, 2) as store_avg_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY u.id, u.name, u.email, u.role, u.address, u.created_at, s.name
       ORDER BY u.${sortField} ${sortOrder}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset],
    );

    res.json({
      users: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(
        parseInt(countResult.rows[0].count) / parseInt(limit),
      ),
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.address, u.created_at,
              s.id as store_id, s.name as store_name,
              ROUND(AVG(r.rating)::numeric, 2) as store_avg_rating,
              COUNT(r.id) as total_ratings
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.email, u.role, u.address, u.created_at, s.id, s.name`,
      [req.params.id],
    );

    if (!result.rows[0])
      return res.status(404).json({ message: "User not found." });
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: "Email already in use." });

    const hashed = await bcrypt.hash(password, 10);
    const validRoles = ["ADMIN", "USER", "STORE_OWNER"];
    const userRole = validRoles.includes(role?.toUpperCase())
      ? role.toUpperCase()
      : "USER";

    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashed, address || null, userRole],
    );

    res.status(201).json({ message: "User created.", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getAllStores = async (req, res, next) => {
  try {
    const {
      name,
      address,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (name) {
      conditions.push(`s.name ILIKE $${idx++}`);
      params.push(`%${name}%`);
    }
    if (address) {
      conditions.push(`s.address ILIKE $${idx++}`);
      params.push(`%${address}%`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const allowedSort = ["name", "created_at", "avg_rating"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = order === "asc" ? "ASC" : "DESC";
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sortExpr =
      sortField === "avg_rating" ? "avg_rating" : `s.${sortField}`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM stores s ${whereClause}`,
      params,
    );

    const dataResult = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.image_url, s.owner_id, s.created_at,
              u.name as owner_name,
              ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN users u ON u.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id, s.name, s.email, s.address, s.image_url, s.owner_id, s.created_at, u.name
       ORDER BY ${sortExpr} ${sortOrder} NULLS LAST
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset],
    );

    res.json({
      stores: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(
        parseInt(countResult.rows[0].count) / parseInt(limit),
      ),
    });
  } catch (err) {
    next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (owner_id) {
      const ownerCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'STORE_OWNER'",
        [owner_id],
      );
      if (!ownerCheck.rows[0]) {
        return res
          .status(400)
          .json({ message: "Owner must have STORE_OWNER role." });
      }
    }

    let imageUrl = null;
    if (req.file) {
      const ext = req.file.originalname.split(".").pop().toLowerCase();
      const fileName = `stores/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      imageUrl = await uploadImage(
        req.file.buffer,
        fileName,
        req.file.mimetype,
      );
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email || null, address || null, owner_id || null, imageUrl],
    );

    res.status(201).json({ message: "Store created.", store: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateStoreImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file)
      return res.status(400).json({ message: "No image file provided." });

    const current = await pool.query(
      "SELECT image_url FROM stores WHERE id = $1",
      [id],
    );
    if (!current.rows[0])
      return res.status(404).json({ message: "Store not found." });

    const oldUrl = current.rows[0].image_url;
    if (oldUrl) {
      const oldPath = extractPathFromUrl(oldUrl);
      if (oldPath) await deleteImage(oldPath);
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const fileName = `stores/${id}-${Date.now()}.${ext}`;
    const newUrl = await uploadImage(
      req.file.buffer,
      fileName,
      req.file.mimetype,
    );

    await pool.query("UPDATE stores SET image_url = $1 WHERE id = $2", [
      newUrl,
      id,
    ]);

    res.json({ message: "Store image updated.", imageUrl: newUrl });
  } catch (err) {
    next(err);
  }
};

const deleteStoreImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT image_url FROM stores WHERE id = $1",
      [id],
    );
    if (!result.rows[0])
      return res.status(404).json({ message: "Store not found." });

    const imageUrl = result.rows[0].image_url;
    if (!imageUrl)
      return res.status(400).json({ message: "Store has no image." });

    const path = extractPathFromUrl(imageUrl);
    if (path) await deleteImage(path);

    await pool.query("UPDATE stores SET image_url = NULL WHERE id = $1", [id]);
    res.json({ message: "Store image removed." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  getAllStores,
  createStore,
  updateStoreImage,
  deleteStoreImage,
};
