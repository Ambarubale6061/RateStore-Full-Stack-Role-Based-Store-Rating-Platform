const { Pool } = require("pg");

// Use DATABASE_URL (recommended for production - Supabase + Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Handle unexpected errors
pool.on("error", (err) => {
  console.error("❌ Unexpected DB pool error:", err);
});

// Test DB connection on server start
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL (Supabase)");
    client.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
