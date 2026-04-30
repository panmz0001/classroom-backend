import express from 'express';
import subjectsRouter from './routes/subjects.js';
import cors from 'cors';

const app = express();
const PORT = 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

// Middleware
app.use(express.json());

app.use('/api/subjects', subjectsRouter);

// Root GET route
app.get('/', (req, res) => {
  res.send('Welcome to the Classroom API' );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
