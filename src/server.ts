import { env } from '@/utils/env.utils';

import { dataSource } from './entities/dataSource';
import { logger } from './utils/logger.utils';
import app from './app';

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
