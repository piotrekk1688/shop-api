import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productsRouter from './routes/products-route';
import usersRouter from './routes/users-route';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbHost = process.env.DB_HOST || '';

mongoose.connect(dbHost)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('failed to connect to MongoDB', error);
  });

app.use(express.json());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
