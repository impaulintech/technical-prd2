import express, { Request, Response } from 'express';
import { Priority, Status } from '@prisma/client';
import prisma from '../lib/prisma.js';

const router = express.Router();
const validStatuses = new Set(Object.values(Status));
const validPriorities = new Set(Object.values(Priority));

router.get('/', async (req: Request, res: Response) => {
  const boardId = req.query.boardId ? Number.parseInt(String(req.query.boardId), 10) : undefined;

  if (boardId !== undefined && Number.isNaN(boardId)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: boardId ? { board_id: boardId } : undefined,
      orderBy: { created_at: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { board_id, title, description, status, assigned_to, priority, due_date } = req.body;

  const boardIdNumber = Number.parseInt(board_id, 10);

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (Number.isNaN(boardIdNumber)) {
    return res.status(400).json({ error: 'board_id is required and must be a number' });
  }

  if (!validStatuses.has(status)) {
    return res.status(400).json({ error: `Status must be one of: ${Array.from(validStatuses).join(', ')}` });
  }

  if (priority && !validPriorities.has(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${Array.from(validPriorities).join(', ')}` });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        assigned_to,
        priority,
        due_date: due_date ? new Date(due_date) : undefined,
        board: {
          connect: { id: boardIdNumber },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  const { board_id, title, description, status, assigned_to, priority, due_date } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  if (status && !validStatuses.has(status)) {
    return res.status(400).json({ error: `Status must be one of: ${Array.from(validStatuses).join(', ')}` });
  }

  if (priority && !validPriorities.has(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${Array.from(validPriorities).join(', ')}` });
  }

  const boardIdNumber = board_id ? Number.parseInt(board_id, 10) : undefined;

  if (board_id !== undefined && Number.isNaN(boardIdNumber)) {
    return res.status(400).json({ error: 'board_id must be a number when provided' });
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(assigned_to !== undefined ? { assigned_to } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(due_date !== undefined ? { due_date: due_date ? new Date(due_date) : null } : {}),
        ...(boardIdNumber !== undefined ? { board: { connect: { id: boardIdNumber } } } : {}),
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
