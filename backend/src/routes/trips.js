import express from 'express';

const router = express.Router();

// Trip routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all trips' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get trip by ID' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create trip' });
});

export default router;
