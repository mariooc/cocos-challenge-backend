import "reflect-metadata"
import express from 'express';
import instrumentRoutes from '@/routes/instrument.router';
import userRoutes from '@/routes/user.router';
import orderRoutes from '@/routes/order.router';

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/instruments', instrumentRoutes);
app.use('/orders', orderRoutes);

export default app;
