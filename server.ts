import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down.');
  console.log(err.name, err.message, err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE!.replace('<PASSWORD>', process.env.DATABASE_PASSWORD!);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App runing on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandler Rejection! Shutting down.');
  if (err) console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
