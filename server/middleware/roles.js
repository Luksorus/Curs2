// Middleware для проверки роли администратора
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
  }
};

// Middleware для проверки роли гида
const isGuide = (req, res, next) => {
  if (req.user && req.user.role === 'guide') {
    next();
  } else {
    res.status(403).json({ error: 'Доступ запрещен. Требуются права гида.' });
  }
};

module.exports = { isAdmin, isGuide }; 