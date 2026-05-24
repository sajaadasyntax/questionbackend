import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import localitiesRouter from './routes/localities';
import villagesRouter from './routes/villages';
import householdsRouter from './routes/households';
import certificatesRouter from './routes/certificates';
import reportsRouter from './routes/reports';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/localities', localitiesRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/households', householdsRouter);
app.use('/api/households', certificatesRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
});
