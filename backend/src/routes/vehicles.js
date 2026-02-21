import express from 'express';

const router = express.Router();

// Vehicle routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all vehicles' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get vehicle by ID' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create vehicle' });
});

export default router;
