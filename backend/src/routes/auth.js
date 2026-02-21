import express from 'express';

const router = express.Router();

// Authentication routes
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

router.get('/me', (req, res) => {
  res.json({ message: 'Get current user' });
});

export default router;
