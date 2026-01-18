import express from 'express';
import cors from 'cors';
import boardsRouter from './routes/boards.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = [
  'http://localhost:3000',
  'https://technical-prd2.vercel.app',
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/api/boards', boardsRouter);
app.use('/api/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
