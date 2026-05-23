require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Bienvenido a la REST API' });
});

app.get('/marco', (req, res) => {
  res.json({ success: true, framework: 'Express', database: 'PostgreSQL' });
});

app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong 🏓', timestamp: new Date().toISOString() });
});

app.use('/users', usersRoutes);
app.use('/login', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});