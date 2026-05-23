const pool = require('../config/db');
const { verifyPassword } = require('./usersController');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email y password requeridos' });
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rowCount === 0)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const user = result.rows[0];
    if (!verifyPassword(password, user.password))
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    res.json({ success: true, message: 'Login exitoso', data: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login };