import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all boards' });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Get board with id: ${id}` });
});

router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create a new board', data: req.body });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Update board with id: ${id}`, data: req.body });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Delete board with id: ${id}` });
});

export default router;
