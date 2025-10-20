import express from 'express';
import cors from 'cors';
import { errorHandler } from '@geschaft/handler/error-handler';
import cookieParser from 'cookie-parser';
import userRoute from './routes/user.routes';
import swaggerUi from 'swagger-ui-express';

const swaggerDocs = require('./swagger-output.json');

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

//! Api docs setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/docs', (req, res) => {
  res.json(swaggerDocs);
});

//! Routes
app.use('/auth', userRoute);

app.use(errorHandler);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is running on http://localhost:${port}/auth`);
  console.log(`Swagger Docs is available on http://localhost:${port}/docs`);
});

server.on('error', (err) => {
  console.log('Server error', err);
  process.exit(1);
});
