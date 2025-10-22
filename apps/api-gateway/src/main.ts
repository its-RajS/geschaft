import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
// import swaggerUi from 'swagger-ui-express';
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
//? Other setups
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.enable('trust proxy'); //for end to end testing

//? rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: (req: any) => (req.user ? 1000 : 100), //* if the user is logged in then 1000 is not 100
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: true,
});
app.use(rateLimiter);

app.get('/api-gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/', proxy('http://localhost:6001'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
