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

// 1. Mismo texto → mismo hash sin sal
const h1 = crypto.createHash('sha256').update('hola').digest('hex');
const h2 = crypto.createHash('sha256').update('hola').digest('hex');
console.log('Mismo texto, mismo hash:', h1 === h2, h1);

// 2. Cambio mínimo → hash completamente diferente
console.log('hola  →', crypto.createHash('sha256').update('hola').digest('hex'));
console.log('Hola  →', crypto.createHash('sha256').update('Hola').digest('hex'));
console.log('hola1 →', crypto.createHash('sha256').update('hola1').digest('hex'));

// 3. Con sal: mismo texto → hashes distintos cada vez
const s1 = hashPassword('miPassword');
const s2 = hashPassword('miPassword');
console.log('Con sal 1:', s1);
console.log('Con sal 2:', s2);
console.log('¿Iguales?', s1 === s2);

// 4. Verificación funciona correctamente
const stored = hashPassword('secreto');
console.log('Verificar "secreto":', verifyPassword('secreto', stored));
console.log('Verificar "Secreto":', verifyPassword('Secreto', stored));