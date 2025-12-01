import express from 'express';
import { Evaluation } from '../models/Evaluation.js';

const router = express.Router();

// Create evaluation
router.post('/', async (req, res) => {
  try {
    const { userId, projectName, recommendedTool, scores, answers } = req.body;

    if (!userId || !recommendedTool || !scores || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const evaluation = await Evaluation.create({
      userId,
      projectName,
      recommendedTool,
      scores,
      answers,
    });

    res.status(201).json({
      message: 'Evaluation created successfully',
      evaluation,
    });
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Failed to create evaluation' });
  }
});

// Get evaluations by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;

    const evaluations = await Evaluation.findByUserId(userId, limit);
    const count = await Evaluation.countByUserId(userId);

    res.json({
      evaluations,
      count,
    });
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Failed to get evaluations' });
  }
});

// Get evaluation by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ evaluation });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Failed to get evaluation' });
  }
});

// Delete evaluation
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const deleted = await Evaluation.delete(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    res.status(500).json({ error: 'Failed to delete evaluation' });
  }
});

export default router;

