const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { email, password, nombre, telefono, direccion } = req.body;

    // Validate required fields
    if (!email || !password || !nombre) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email, password, and name are required',
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, nombre, telefono, direccion, rol)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, nombre, rol`,
      [email, passwordHash, nombre, telefono || null, direccion || null, 'cliente']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
}

/**
 * Logout user (client-side operation, server confirms)
 */
function logout(req, res) {
  return res.status(200).json({
    message: 'Logged out successfully',
  });
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, email, nombre, telefono, direccion, rol FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get profile',
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
};
