import express, { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const boards = await prisma.board.findMany({
      include: { tasks: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { name, description, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const board = await prisma.board.create({
      data: {
        name,
        description,
        color,
      },
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  const { name, description, color } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    const board = await prisma.board.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });

    res.json(board);
  } catch (error) {
    console.error('Error updating board', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    await prisma.board.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting board', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;
