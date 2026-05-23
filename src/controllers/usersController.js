const pool = require('../config/db');
const crypto = require('crypto');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedValue) => {
  const [salt, storedHash] = storedValue.split(':');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return hash === storedHash;
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, created_at FROM usuarios ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, hashPassword(password)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505')
      return res.status(409).json({ success: false, message: 'El email ya existe' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const current = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
    if (current.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const u = current.rows[0];
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, email=$2, password=$3 WHERE id=$4 RETURNING id, nombre, email',
      [nombre || u.nombre, email || u.email, password ? hashPassword(password) : u.password, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id=$1 RETURNING id, nombre', [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario eliminado', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, hashPassword, verifyPassword };