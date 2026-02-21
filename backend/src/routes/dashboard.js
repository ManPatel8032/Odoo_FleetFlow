import express from 'express';

const router = express.Router();

// Dashboard routes
router.get('/stats', (req, res) => {
  res.json({ message: 'Get dashboard stats' });
});

router.get('/fleet-stats', (req, res) => {
  res.json({ message: 'Get fleet stats' });
});

export default router;
