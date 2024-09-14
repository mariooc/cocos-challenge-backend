import express from 'express';
import { env } from '@/utils/env.utils';

import instrumentRoutes from '@/routes/instrument.router';
import userRoutes from '@/routes/user.router';
import orderRoutes from '@/routes/order.router';
import dataSource from './entities/dataSource';
import { logger } from './utils/logger.utils';

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/instruments', instrumentRoutes);
app.use('/orders', orderRoutes);

const tryConnection = async () => {
  try {
    dataSource.initialize();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Error connecting to the database', error);
  }
};

const startServer = async () => {
  try {
    const { PORT } = env;
    await tryConnection();
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Error connecting to the database', error);
  }
};

startServer();
