import express, { Router } from 'express';
import { userRegistration } from '../controllers/user.controller';

const userRoute: Router = express.Router();

userRoute.post('/user-registration', userRegistration);

export default userRoute;
