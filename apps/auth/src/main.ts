import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../../packages/handler/error-handler';
import cookieParser from 'cookie-parser';

const app = express();
//? setup cors
app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Auth service is running' });
});

app.use(errorHandler);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is running on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.log('Server error', err);
  process.exit(1);
});
