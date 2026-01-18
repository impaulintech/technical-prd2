import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all tasks' });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Get task with id: ${id}` });
});

router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create a new task', data: req.body });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Update task with id: ${id}`, data: req.body });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Delete task with id: ${id}` });
});

export default router;
